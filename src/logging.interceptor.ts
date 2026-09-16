import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { method, originalUrl } = req;
    const started = process.hrtime.bigint();

    return next.handle().pipe(
      tap({
        next: () => {
          const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
          this.logger.log(
            `${method} ${originalUrl} ${res.statusCode} ${elapsedMs.toFixed(1)}ms`,
          );
        },
        error: (err: Error) => {
          const elapsedMs = Number(process.hrtime.bigint() - started) / 1e6;
          this.logger.warn(
            `${method} ${originalUrl} ${res.statusCode} ${elapsedMs.toFixed(1)}ms - ${err.message}`,
          );
        },
      }),
    );
  }
}