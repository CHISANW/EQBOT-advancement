import { Injectable } from '@nestjs/common';
import { Logger } from '../../config/logger/logger.service';
import { RabbitmqService } from './rabbitmq.service';
import { EXCHANGE } from './constants/exchange.constants';
import { ROUTING_KEY } from './constants/routing-key.constants';
import { PRODUCE_BIND } from './constants/produce-bind.constants';

export type RoutingKeyToType<T extends (typeof PRODUCE_BIND)[keyof typeof PRODUCE_BIND]> = {
    [K in keyof typeof ROUTING_KEY]: (typeof ROUTING_KEY)[K]['name'] extends T['routingKey']
        ? InstanceType<(typeof ROUTING_KEY)[K]['type']>
        : never;
}[keyof typeof ROUTING_KEY];

@Injectable()
export class RabbitmqProduceService {
    constructor(private readonly logger: Logger) {}

    async assertExchange() {
        // produce
        const EXCHANGE_LIST = Object.values(EXCHANGE);
        EXCHANGE_LIST.map(async (exchange) => {
            await RabbitmqService.channel.assertExchange(exchange.name, exchange.type, {
                durable: false,
            });
        });
    }

    async sendMessage<T extends (typeof PRODUCE_BIND)[keyof typeof PRODUCE_BIND]>(
        produceBind: T,
        data: RoutingKeyToType<T>,
    ) {
        try {
            const messageBuffer = Buffer.from(
                JSON.stringify({
                    data,
                }),
            );
            const exchange = produceBind.exchange.name;
            const { routingKey } = produceBind;

            // let b = RabbitmqService.channel.publish(exchange, routingKey, messageBuffer);

            const success = RabbitmqService.channel.publish(
                exchange,
                routingKey,
                messageBuffer,
                { mandatory: true }, // 메시지가 큐에 도달하지 않으면 반환됨
            );
            //
            // console.log('Publish success:', success);
        } catch (error) {
            this.logger.error(error);
        }
    }
}
