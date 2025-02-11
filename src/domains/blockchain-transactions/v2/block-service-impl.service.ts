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
import { Web3Service } from '../../../providers/web3/v2/web3Service';

@Injectable()
export class BlockServiceImplV2 implements BlockService {
    constructor(
        private readonly userService: UserService,
        private readonly rabbitmqService: RabbitmqProduceService,
        @Inject('ViewService') private readonly viewService: ViewService,
        @Inject('TokenService') private readonly tokenService: TokenService,
        @Inject('CoinService') private readonly coinService: CoinService,
        @Inject('Web3Service') private readonly web3Service: Web3Service,
    ) {}

    async testMQ(groupId: number, count?: number) {
        // for (let i = 1; i <= 5; i++) {
        //     const data = {
        //         uuid: uuidv4().toString(),
        //         content: i.toString(),
        //     };
        //     this.rabbitmqService.sendMessage(PRODUCE_BIND.BOT_TRANSACTION, data);
        // }

        const promise = this.userService.group(count);
        console.log('프로미스', promise);
        if (!promise) {
            console.log('실행');
            await this.web3Service.createAccounts();
            await this.userService.group(count);
        }
        // this.userService.softDeleteAccount(groupId);
    }

    async generateRandomTransactions(iteration: number, amount: string, email: string) {
        let number = this.viewService.printTransactionSummary(iteration);
        await this.coinService.sendCoin('1', '1', 1);
        // let number1 = await this.userService.totalCount();
        // console.log('다단', number1);
        await this.executeTransactions(number, amount, email);
    }

    private async executeTransactions(number: number, amount: string, email: string) {
        let index = 1;
        const randomUUID = uuidv4().toString();

        // if (email) {
        //     this.rabbitmqService.sendMessage(PRODUCE_BIND.BOT_MAIL, BotEmail.of(randomUUID, email));
        // }
    }
}
