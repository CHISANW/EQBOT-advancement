import { Injectable } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { QUEUE } from './constants/queue.constants';
import { ConsumeMessage } from 'amqplib';

@Injectable()
export class RabbitmqConsumeService {
    constructor() {}

    async assertQueue() {
        const queueList = Object.values(QUEUE);
        queueList.map(async (queue) => {
            await RabbitmqService.channel.assertQueue(queue, { durable: false });
        });
    }
}
