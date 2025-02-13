import { QUEUE } from './queue.constants';

export const CONSUME_BIND = [
    {
        queue: QUEUE.BOT_TRANSACTION_QUEUE,
        exchange: 'bot2',
        routingKey: {
            name: 'BOT-TRANSACTION',
            version: '1.0.0',
        },
    },
    {
        queue: QUEUE.BOT_FILE_QUEUE,
        exchange: 'bot1',
        routingKey: {
            name: 'BOT-FILE',
            version: '1.0.0',
        },
    },
    {
        queue: QUEUE.BOT_EMAIL_QUEUE,
        exchange: 'bot1',
        routingKey: {
            name: 'BOT-EMAIL',
            version: '1.0.0',
        },
    },

    {
        queue: QUEUE.BOT_COIN_QUEUE,
        exchange: 'bot2',
        routingKey: {
            name: 'BOT-COIN',
            version: '1.0.0',
        },
    },
    {
        queue: QUEUE.BOT_TOKEN_QUEUE,
        exchange: 'bot2',
        routingKey: {
            name: 'BOT-TOKEN',
            version: '1.0.0',
        },
    },
    {
        queue: QUEUE.BOT_STOP_QUEUE,
        exchange: 'bot2',
        routingKey: {
            name: 'BOT-STOP',
            version: '1.0.0',
        },
    },
];
