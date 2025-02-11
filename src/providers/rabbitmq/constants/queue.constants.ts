import { Config } from 'src/config/environment/config';

const environment = Config.getEnvironment().SERVER_ENVIRONMENT_ID.toUpperCase();

export const QUEUE = {
    // SAMPLE_QUEUE: `${environment}_SAMPLE_QUEUE`,
    // TARGET_QUEUE: `${environment}_TARGET_QUEUE`,
    BOT_TRANSACTION_QUEUE: `BOT_TRANSACTION_QUEUE`,
    BOT_FILE_QUEUE: `BOT_FILE_QUEUE`,
    BOT_EMAIL_QUEUE: `BOT_EMAIL_QUEUE`,
};
