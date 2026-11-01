import {
  ValidationPipe,
  ValidationError,
  BadRequestException,
} from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]) => {
        const formatErrors = (errs: ValidationError[]): string[] => {
          const messages: string[] = [];
          for (const err of errs) {
            if (err.constraints) {
              messages.push(...Object.values(err.constraints));
            }
            if (err.children && err.children.length > 0) {
              messages.push(...formatErrors(err.children));
            }
          }
          return messages;
        };

        const errorMessages = formatErrors(errors);
        return new BadRequestException(errorMessages);
      },
    });
  }
}
