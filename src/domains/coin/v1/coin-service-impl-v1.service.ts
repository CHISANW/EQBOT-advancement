import { Inject, Injectable } from '@nestjs/common';
import { Web3ServiceV1 } from '../../../providers/web3/v1/web3-service-v1.service';
import { UserService } from '../../user/user.service';
import { RabbitmqService } from '../../../providers/rabbitmq/rabbitmq.service';
import { ViewService } from '../../../providers/view/view.service';
import { APP } from '../../../config/constants/constants';
import { Account } from '../../user/entites/account.entity';
import { CoinService } from '../coin.service';

@Injectable()
export class CoinServiceImplV1 {
    constructor(
        private readonly web3Service: Web3ServiceV1,
        private readonly userService: UserService,
        private readonly rabbitMQService: RabbitmqService,
        @Inject('ViewService') private readonly viewService: ViewService,
    ) {}

    async sendCoin(
        user: any,
        index: number,
        uuid: any,
        retry: number = APP.RETRY_COUNT,
    ): Promise<number> {
        if (index === 11) {
            return index;
        }
        try {
            await this.sendCoinTransaction(user.from, user.to, uuid);
        } catch (err) {
            if (retry > APP.ZERO) {
                return await this.retrySendCoin(user, index, retry, uuid);
            }
        }

        let nextFromId = user.to.user_id;
        let nextToId = nextFromId === 10 ? 1 : nextFromId + 1;

        return await this.sendCoin(
            await this.userService.findUsers(nextFromId, nextToId),
            index + 1,
            uuid,
            retry - 1,
        );
    }

    private async sendCoinTransaction(from: Account, to: Account, uuid: any) {
        return await this.web3Service
            .transaction(from?.address, from?.private_key, to?.address)
            .then(async (transaction) => {
                // await this.rabbitMQService.publishCoin(transaction);
                // await this.rabbitMQService.publishFile(uuid, transaction);
                this.viewService.printCoinTransactionLog(transaction);
                return transaction;
            });
    }

    private async retrySendCoin(user: any, index: number, retry: number, uuid: any) {
        await new Promise((resolve) => setTimeout(resolve, APP.WAIT_TIME));
        return await this.sendCoin(user, index, uuid, retry);
    }
}
