import { Inject, Injectable } from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { ViewService } from '../../../providers/view/view.service';
import { UserService } from '../../user/user.service';
import { v4 as uuidv4 } from 'uuid';
import { CoinService } from '../../coin/coin.service';
import { RabbitmqService } from '../../../providers/rabbitmq/rabbitmq.service';
import { PRODUCE_BIND } from '../../../providers/rabbitmq/constants/produce-bind.constants';
import { RabbitmqProduceService } from '../../../providers/rabbitmq/rabbitmq-produce.service';
import { BotEmail } from '../../../providers/rabbitmq/dtos/rabbitmq.dto';
import { BlockService } from '../block-service';

@Injectable()
export class BlockServiceImplV1 implements BlockService {
    constructor(
        private readonly userService: UserService,
        private readonly rabbitmqService: RabbitmqProduceService,
        @Inject('ViewService') private readonly viewService: ViewService,
        @Inject('TokenService') private readonly tokenService: TokenService,
        @Inject('CoinService') private readonly coinService: CoinService,
    ) {}

    testMQ() {}

    async generateRandomTransactions(iteration: number, amount: string, email: string) {
        let number = this.viewService.printTransactionSummary(iteration);
        await this.executeTransactions(number, amount, email);
    }

    private async executeTransactions(number: number, amount: string, email: string) {
        let index = 1;
        const randomUUID = uuidv4().toString();
        // await Promise.all(
        //     Array.from({ length: 1 }).map(async (_, i) => {
        //         const user = await this.userService.findUsers(1, 2);
        //         const [newIndex] = await Promise.all([
        //             this.coinService.sendCoin(user, index, randomUUID),
        //             this.tokenService.sendToken(2, amount, randomUUID),
        //         ]);
        //         index = newIndex;
        //     }),
        // );

        // let promise = new Promise((resolve, reject) => {
        //     setTimeout(() => {
        //         resolve('ok');
        //     }, 10000);
        // }).then(console.log);
        //
        // console.log('프로미스 ', promise);

        if (email) {
            this.rabbitmqService.sendMessage(PRODUCE_BIND.BOT_MAIL, BotEmail.of(randomUUID, email));
        }
    }
}
