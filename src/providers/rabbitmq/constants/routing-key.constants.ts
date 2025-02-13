import {
    BotTransaction,
    BotFile,
    BotEmail,
    BotTransactionDto,
    BotStopDto,
} from '../dtos/rabbitmq.dto';

export const ROUTING_KEY = {
    BOT_TX: {
        name: 'BOT-TRANSACTION',
        type: BotTransactionDto,
        version: '1.0.0',
    },
    BOT_FILE: {
        name: 'BOT-FILE',
        type: BotFile,
        version: '1.0.0',
    },
    BOT_MAIL: {
        name: 'BOT-EMAIL',
        type: BotEmail,
        version: '1.0.0',
    },
    BOT_COIN: {
        name: 'BOT-COIN',
        type: BotTransactionDto,
        version: '1.0.0',
    },
    BOT_TOKEN: {
        name: 'BOT-TOKEN',
        type: BotTransactionDto,
        version: '1.0.0',
    },
    BOT_STOP: {
        name: 'BOT-STOP',
        type: BotStopDto,
        version: '1.0.0',
    },
} as const;

/**
 * @description
 * DTO 정의위치
 * - Publish: src/providers/rabbitmq/dtos/rabbitmq.dto.ts
 * - Subscribe: src/domains/{domain}/{version}/dtos/{domain}-req-{version}.dto.ts
 */
