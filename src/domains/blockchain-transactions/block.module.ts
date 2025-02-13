import { forwardRef, Module } from '@nestjs/common';
import { Web3Module } from '../../providers/web3/web3.module';
import { UserModule } from '../user/user.module';
import { TokenModule } from '../token/token.module';
import { ViewModule } from '../../providers/view/view.module';
import { CoinModule } from '../coin/coin.module';
import { RabbitmqModule } from '../../providers/rabbitmq/rabbitmq.module';
import { BlockControllerV2 } from './v2/block-controllerV2';
import { BlockServiceImplV2 } from './v2/block-service-impl.service';
import { TransactionHandlerFactory } from './handler/transaction-handler-factory';
import { testService } from './v2/test.init.service';

@Module({
    imports: [
        Web3Module,
        UserModule,
        forwardRef(() => RabbitmqModule),
        TokenModule,
        ViewModule,
        CoinModule,
    ],
    providers: [
        testService,
        TransactionHandlerFactory,
        {
            provide: 'BlockService',
            useClass: BlockServiceImplV2,
        },
    ],
    controllers: [BlockControllerV2],
    exports: ['BlockService', TransactionHandlerFactory, testService],
})
export class BlockModule {}
