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
export class SocketGlobalInterceptor implements NestInterceptor {
    intercept (context: ExecutionContext, next: CallHandler<any>) {
        return next.handle().pipe(
            map((data) => {
                if (!data.event) {
                    throw new WsException(ERRORS('COMM0013'));
                }
                return data;
            }),
        );
    }
}
