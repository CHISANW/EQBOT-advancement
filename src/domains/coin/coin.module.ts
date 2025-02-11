import { Module } from '@nestjs/common';
import { Web3Module } from '../../providers/web3/web3.module';
import { UserModule } from '../user/user.module';
import { ViewModule } from '../../providers/view/view.module';
import { FileModule } from '../file/file.module';
import { RabbitmqModule } from '../../providers/rabbitmq/rabbitmq.module';
import { CoinServiceImplV2 } from './v2/coin-service-impl-v2.service';

@Module({
    imports: [Web3Module, RabbitmqModule, UserModule, ViewModule, FileModule],
    providers: [
        {
            provide: 'CoinService',
            useClass: CoinServiceImplV2,
        },
    ],
    exports: ['CoinService'],
})
export class CoinModule {}
