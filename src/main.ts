import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from './config/logger/logger.service';
import helmet from 'helmet';
import { Config } from './config/environment/config';
import cookieParser from 'cookie-parser';
import { GlobalValidationPipe } from './core/pipes/global-validation-options.pipe';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { QUEUE } from './providers/rabbitmq/constants/queue.constants';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error'],
    });

    app.useLogger(app.get(Logger));

    // 보안 관련 설정
    app.enableCors();
    app.use(helmet());

    // 전역 설정
    app.useGlobalPipes(GlobalValidationPipe);
    app.use(cookieParser());

    app.setGlobalPrefix('/api', {
        exclude: ['/health', '/health/all-systems', '/health/external-systems'],
    });

    // rabbitmq 설정
    const { RABBITMQ } = Config.getEnvironment();
    const QueueList = Object.values(QUEUE);
    QueueList.forEach((queue) => {
        if (queue !== '') {
            app.connectMicroservice<MicroserviceOptions>({
                transport: Transport.RMQ,
                options: {
                    urls: [
                        `${RABBITMQ.PROTOCOL}://${RABBITMQ.ID}:${RABBITMQ.PASSWORD}@${RABBITMQ.HOST}:${RABBITMQ.PORT}`,
                    ],
                    queue,
                    queueOptions: {
                        durable: false,
                    },
                    noAck: false,
                },
            });
        }
    });
    await app.startAllMicroservices();

    // 서버 실행
    await app.listen(Config.getEnvironment().SERVER_PORT);
    const logger = app.get(Logger);

    const exitHandler = () => {
        logger.info('Server closed');
        process.exit(1);
    };

    const unexpectedErrorHandler = (error: Error) => {
        logger.error('Unexpected error', error);
        exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('warning', (warning) => {
        logger.error(`Warning: ${warning.name} - ${warning.message}\n${warning.stack}`);
    });

    process.on('SIGINT', exitHandler);
}
bootstrap();
