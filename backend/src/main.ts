import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const port = process.env.PORT || 4000;
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3001,http://localhost:3002,http://localhost:3003').split(',');

  // CORS
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Static files for uploads
  const uploadsDir = process.env.UPLOAD_DIR || './uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(join(process.cwd(), uploadsDir), {
    prefix: '/uploads',
  });

  // Global pipes & filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('BAMS API')
    .setDescription('Business Account Management System — REST API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('businesses', 'Business management')
    .addTag('transactions', 'Financial transactions')
    .addTag('categories', 'Transaction categories')
    .addTag('reports', 'Report generation')
    .addTag('notifications', 'Notification management')
    .addTag('audit', 'Audit logs')
    .addTag('uploads', 'File uploads')
    .addTag('daily-reports', 'Daily report management')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, swaggerDoc, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  await app.listen(port);

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`  🚀 BAMS Backend running on http://localhost:${port}/api`);
  console.log(`  📚 Swagger docs:     http://localhost:${port}/api/docs`);
  console.log(`  📁 File uploads:     http://localhost:${port}/uploads`);
  console.log('════════════════════════════════════════════════════════════\n');
}

bootstrap();
