import { Type, plainToClass } from 'class-transformer';
import { IsIn, IsNumber, IsString, ValidateNested } from 'class-validator';
import { DatabaseConfig } from './configs/database.config';
import { RabbitMQConfig } from './configs/rabbitmq.config';
import { MailConfig } from './configs/nodemailer.config';
import process from 'node:process';

export class Environment {
    @IsString()
    EQHUB_KEY = process.env.EQHUB_KEY;
    @IsIn(['production', 'test', 'development'])
    NODE_ENV = process.env.NODE_ENV as 'production' | 'test' | 'development';

    @IsString()
    ACCOUNT_ID = process.env.ACCOUNT_ID;

    @IsString()
    EQ_API = process.env.EQ_ENDPOINT;

    @IsString()
    META_ADDRESS = process.env.META_ADDRESS;

    @IsString()
    SERVICE_NAME = process.env.SERVICE_NAME;

    @Type(() => Number)
    @IsNumber()
    SERVER_PORT = process.env?.SERVER_PORT ? Number(process.env.SERVER_PORT) : 3010;

    @IsString()
    COMPANY_NETWORK = process.env?.COMPANY_NETWORK
        ? process.env?.COMPANY_NETWORK
        : '115.93.255.204';

    @IsIn(['feature', 'stage', 'production'])
    SERVER_ENVIRONMENT_ID = process.env.SERVER_ENVIRONMENT_ID as 'feature' | 'stage' | 'production';

    @ValidateNested()
    @Type(() => DatabaseConfig)
    DB_1: DatabaseConfig = plainToClass(DatabaseConfig, {
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port: Number(process.env.DB_PORT),
    });

    // @IsString()
    // SOCKET_URL = process.env.SOCKET_URL;

    // @IsString()
    // DEVELOPER_USER_SERVER_ADDR = process.env.DEVELOPER_USER_SERVER_ADDR;

    // @IsString()
    // AUTH_SERVER_ADDR = process.env.AUTH_SERVER_ADDR;

    // @IsString()
    DATA_RELAYING_APP_SERVER_ADDR = process.env.DATA_RELAYING_APP_SERVER_ADDR;

    @IsString()
    EQHUB_API_KEY = process.env.EQHUB_API_KEY;

    // @IsString()
    // EQHUB_AG_SERVER_ADDR = process.env.EQHUB_AG_SERVER_ADDR;

    // @ValidateNested()
    // @Type(() => MailConfig)
    // adminMail: MailConfig = plainToClass(MailConfig, {
    //     name: process.env.ADMIN_EMAIL_NAME,
    //     transport: process.env.ADMIN_EMAIL_TRANSPORT,
    // });
    //
    // @ValidateNested()
    // @Type(() => MailConfig)
    // hrMail: MailConfig = plainToClass(MailConfig, {
    //     name: process.env.HR_EMAIL_NAME,
    //     transport: process.env.HR_EMAIL_TRANSPORT,
    // });

    @ValidateNested()
    @Type(() => RabbitMQConfig)
    RABBITMQ: RabbitMQConfig = plainToClass(RabbitMQConfig, {
        PROTOCOL: process.env.RABBIT_MQ_PROTOCOL,
        HOST: process.env.RABBIT_MQ_HOST,
        ID: process.env.RABBIT_MQ_ID,
        PASSWORD: process.env.RABBIT_MQ_PASSWORD,
        ENVIRONMENT: process.env.RABBIT_MQ_ENVIRONMENT,
        PORT: Number(process.env.RABBIT_MQ_PORT),
        RETRY_COUNT: Number(process.env.RABBIT_MQ_RETRY_COUNT),
        QUEUE: process.env.SERVER_ENVIRONMENT_ID,
        EXCHANGE: process.env.SERVER_ENVIRONMENT_ID,
        ROUTING_KEY: process.env.SERVER_ENVIRONMENT_ID,
    });
}
