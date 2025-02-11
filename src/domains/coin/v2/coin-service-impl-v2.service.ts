import { Inject, Injectable } from '@nestjs/common';
import { CoinService } from '../coin.service';
import { Web3ServiceV1 } from '../../../providers/web3/v1/web3-service-v1.service';
import { UserService } from '../../user/user.service';
import { RabbitmqService } from '../../../providers/rabbitmq/rabbitmq.service';
import { ViewService } from '../../../providers/view/view.service';
import { APP } from '../../../config/constants/constants';
import { Account } from '../../user/entites/account.entity';

@Injectable()
export class CoinServiceImplV2 implements CoinService {
    constructor(
        private readonly web3Service: Web3ServiceV1,
        private readonly userService: UserService,
        private readonly rabbitMQService: RabbitmqService,
        @Inject('ViewService') private readonly viewService: ViewService,
    ) {}

    async sendCoin(user: any, uuid: any, retry?: number): Promise<number> {
        let users = await this.userService.totalCount();
        let maxUser = await this.userService.findMaxAmountUser();
        let minUser = await this.userService.findMinAmountUser();

        const random = Math.floor(Math.random() * maxUser.amount) + 1;

        console.log('최댓 값', maxUser.user_id);
        console.log('최솟 값', minUser.user_id);
        console.log('랜덤 값', random);

        // for (let i = 1; i <= users; i++) {
        //     this.sendCoinTransaction(maxUser, minUser);
        // }

        return 1;
        // try {
        //     await this.sendCoinTransaction(user.from, user.to, uuid);
        // } catch (err) {
        //     if (retry > APP.ZERO) {
        //         return await this.retrySendCoin(user, retry, uuid);
        //     }
        // }
        //
        // let nextFromId = user.to.user_id;
        // let nextToId = nextFromId === 10 ? 1 : nextFromId + 1;
        //
        // return await this.sendCoin(
        //     await this.userService.findUsers(nextFromId, nextToId),
        //     uuid,
        //     retry - 1,
        // );
    }

    private async sendCoinTransaction(from: Account, to: Account, amount: number) {
        return await this.web3Service
            .transaction(from?.address, from?.private_key, to?.address)
            .then(async (transaction) => {
                // await this.rabbitMQService.publishCoin(transaction);
                // await this.rabbitMQService.publishFile(uuid, transaction);
                this.viewService.printCoinTransactionLog(transaction);
                return transaction;
            });
    }

    private async retrySendCoin(user: any, retry: number, uuid: any) {
        await new Promise((resolve) => setTimeout(resolve, APP.WAIT_TIME));
        return await this.sendCoin(user, uuid, retry);
    }
}
