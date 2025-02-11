import { QUEUE } from './queue.constants';

export const CONSUME_BIND = [
    {
        queue: QUEUE.BOT_TRANSACTION_QUEUE,
        exchange: 'bot1',
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
];
