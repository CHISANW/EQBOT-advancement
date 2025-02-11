import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '../../config/logger/logger.service';

@Injectable()
export class ApiCounterInterceptor implements NestInterceptor {
    constructor(private readonly logger: Logger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();

        const data = { ...req.query, ...req.body, ...req.param };
        return next.handle().pipe(
            tap(async () => {
                try {
                    if (req.authenticate_type && req.authenticate_type === 'apiKey') {
                        const sender = JSON.parse(req.sender);

                        if (sender.projectId === -1) {
                            return false;
                        }
                    }
                    return true;
                } catch (error) {
                    this.logger.error('apiCounter error', error);
                    return true;
                }
            }),
        );
    }
}
