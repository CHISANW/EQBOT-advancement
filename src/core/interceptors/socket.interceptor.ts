import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { WsException } from '@nestjs/websockets';
import { ERRORS } from 'src/config/errors/error';

@Injectable()
export class SocketInterceptor implements NestInterceptor {
    constructor (private readonly eventName: string) {}

    intercept (context: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map((data) => {
                if (!data) {
                    throw new WsException(ERRORS('COMM0012'));
                }
                return { event: this.eventName, data };
            }),
        );
    }
}
