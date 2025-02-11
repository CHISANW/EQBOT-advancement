import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch(WsException)
export class SocketExceptionFilter implements ExceptionFilter {
    async catch (exception: WsException, host: ArgumentsHost) {
        const ctx = host.switchToWs();
        const client = ctx.getClient();
        const pattern = host.switchToWs().getPattern();
        const data = host.switchToWs().getData();

        const errorResponse = {
            event: pattern,
            error: exception.message || 'Internal server error',
        };

        if (!data || !data.event || exception.getError()) {
            client.emit('error', errorResponse);
        }
    }
}
