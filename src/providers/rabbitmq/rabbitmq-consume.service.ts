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

    async consumeMessages() {
        const queueName = QUEUE.BOT_TRANSACTION_QUEUE; // 사용할 큐 지정

        await RabbitmqService.channel.consume(queueName, async (msg: ConsumeMessage | null) => {
            if (msg) {
                const content = msg.content.toString();
                console.log(`📥 수신 메시지: ${content}`);

                if (content === '3') {
                    console.log('⏳ 3번 메시지 도착 → 이후 메시지 처리 대기...');
                    RabbitmqService.channel.prefetch(0); // **큐를 멈춤**
                    await new Promise((resolve) => setTimeout(resolve, 10000)); // 10초 대기
                    console.log('✅ 3번 메시지 처리 완료 → 큐 다시 시작!');
                    RabbitmqService.channel.prefetch(5); // **다시 병렬 처리 시작**
                }

                RabbitmqService.channel.ack(msg); // 메시지 처리 완료
            }
        });
    }
}
