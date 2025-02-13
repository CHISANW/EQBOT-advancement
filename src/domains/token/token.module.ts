import { Module } from '@nestjs/common';
import { Web3Module } from '../../providers/web3/web3.module';
import { UserModule } from '../user/user.module';
import { AxiosModule } from '../../providers/axios/axios.module';
import { ViewModule } from '../../providers/view/view.module';
import { RabbitmqModule } from '../../providers/rabbitmq/rabbitmq.module';
import { TokenServiceImplV2 } from './v2/token-service-impl-v2.service';
import { TokenTransactionHandler } from './v2/token-handler.service';
import { CoinModule } from '../coin/coin.module';

@Module({
    imports: [Web3Module, UserModule, AxiosModule, ViewModule, RabbitmqModule, CoinModule],
    providers: [
        TokenTransactionHandler,
        {
            provide: 'TokenService',
            useClass: TokenServiceImplV2,
        },
    ],
    controllers: [],
    exports: ['TokenService', TokenTransactionHandler],
})
export class TokenModule {}
