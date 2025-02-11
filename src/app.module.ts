import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { LoggerModule } from './config/logger/logger.module';
import { HealthModule } from './domains/health-check/health.module';
import { LoggerMiddleware } from './core/middlewares/logger.middleware';
import { Logger } from './config/logger/logger.service';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { RabbitmqModule } from './providers/rabbitmq/rabbitmq.module';
import { MysqlModule } from './providers/mysql/mysql.module';
import { ClsConfigModule } from './providers/cls/cls.module';
import { MailModule } from './providers/mail/mail.module';
import { Web3Module } from './providers/web3/web3.module';
import { AxiosModule } from './providers/axios/axios.module';
import { ViewModule } from './providers/view/view.module';
import { BlockModule } from './domains/blockchain-transactions/block.module';
import { TokenModule } from './domains/token/token.module';
import { UserModule } from './domains/user/user.module';
import { CoinModule } from './domains/coin/coin.module';

@Module({
    imports: [
        LoggerModule,
        ClsConfigModule,
        MysqlModule,
        RabbitmqModule,
        HealthModule,
        MailModule,
        ViewModule,
        AxiosModule,
        Web3Module,
        BlockModule,
        CoinModule,
        TokenModule,
        UserModule,
    ],
    controllers: [],
    providers: [
        {
            provide: 'APP_FILTER',
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule implements NestModule {
    constructor(
        private readonly logger: Logger,
        private readonly clsService: ClsService,
    ) {}

    // 모든 요청에 대한 미들웨어 설정(log)
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply((req, res, next) => {
                new LoggerMiddleware(this.logger, this.clsService).use(req, res, next);
            })
            .exclude(
                { path: 'health', method: RequestMethod.GET },
                { path: 'health/all-systems', method: RequestMethod.GET },
                { path: 'health/external-systems', method: RequestMethod.GET },
            )
            .forRoutes('*');
    }
}
