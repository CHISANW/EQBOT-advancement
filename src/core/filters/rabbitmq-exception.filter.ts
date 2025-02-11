import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RabbitMQExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger();

    async catch(exception: any, host: ArgumentsHost) {
        const channel = host.switchToRpc().getContext().getChannelRef();
        const originalMessage = host.switchToRpc().getContext().getMessage();
        this.logger.error(exception);
        channel.ack(originalMessage);
    }
}
