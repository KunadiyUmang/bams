import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, user, ip } = request as any;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            const actorEmail = user?.email || 'Anonymous';
            const actorId = user?.userId || user?.id || 'Unknown';
            this.logger.log(
              `[AUDIT] ${method} ${url} by user:${actorEmail} (${actorId}) from IP:${ip} completed in ${duration}ms`,
            );
          }
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          const actorEmail = user?.email || 'Anonymous';
          this.logger.warn(
            `[AUDIT-ERROR] ${method} ${url} by user:${actorEmail} failed in ${duration}ms: ${err.message}`,
          );
        },
      }),
    );
  }
}
