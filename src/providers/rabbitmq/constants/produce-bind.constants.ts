import { EXCHANGE } from './exchange.constants';
import { ROUTING_KEY } from './routing-key.constants';

export const PRODUCE_BIND = {
    BOT_TRANSACTION: {
        exchange: EXCHANGE.BOT,
        routingKey: ROUTING_KEY.BOT_TX.name,
    },
    BOT_FILE: {
        exchange: EXCHANGE.BOT,
        routingKey: ROUTING_KEY.BOT_FILE.name,
    },
    BOT_MAIL: {
        exchange: EXCHANGE.BOT,
        routingKey: ROUTING_KEY.BOT_MAIL.name,
    },
};
