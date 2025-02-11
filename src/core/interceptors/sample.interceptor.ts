import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class SampleInterceptor implements NestInterceptor {
    intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
        console.log('Before handling the request');
        const now = Date.now();

        return next
            .handle()
            .pipe(
                tap(() => console.log(`After handling the request in ${Date.now() - now}ms`)),
            );
    }
}
