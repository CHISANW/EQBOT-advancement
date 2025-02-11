import { RabbitMqRetryHandler } from './rabbitmq-retry-handler.decorator';
import { applyDecorators, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { RabbitMQInterceptor } from '../interceptors/rabbitmq.interceptor';
import { MqValidationOptionsPipe } from '../pipes/rabbitmq-validation-options.pipe';
import { RabbitMQExceptionFilter } from '../filters/rabbitmq-exception.filter';
import { EventPattern } from '@nestjs/microservices';

export function RabbitmqSubscribe(routingKey: string, retryCount: number = 10) {
    const decorators = [];

    decorators.push(RabbitMqRetryHandler(retryCount));
    decorators.push(EventPattern());
    decorators.push(UseInterceptors(new RabbitMQInterceptor(routingKey)));
    decorators.push(UsePipes(MqValidationOptionsPipe));
    decorators.push(UseFilters(RabbitMQExceptionFilter));

    return applyDecorators(...decorators);
}
