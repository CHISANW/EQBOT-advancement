import { Module } from '@nestjs/common';

import { RabbitmqService } from './rabbitmq.service';
import { LoggerModule } from '../../config/logger/logger.module';
import { RabbitmqProduceService } from './rabbitmq-produce.service';
import { RabbitmqConsumeService } from './rabbitmq-consume.service';
import { RabbitMQDocumentationService } from './rabbitmq-documentation.service';
import { RabbitmqBinderService } from './rabbitmq-binder.service';

@Module({
    imports: [LoggerModule],
    controllers: [],
    providers: [
        RabbitmqService,
        RabbitmqBinderService,
        RabbitmqProduceService,
        RabbitmqConsumeService,
        RabbitMQDocumentationService,
    ],
    exports: [
        RabbitmqService,
        RabbitmqProduceService,
        RabbitmqConsumeService,
        RabbitmqBinderService,
    ],
})
export class RabbitmqModule {}
