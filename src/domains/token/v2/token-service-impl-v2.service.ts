import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from '../../user/repositories/account.repository';
import { AxiosProvider } from '../../../providers/axios/axios-provider.service';
import { APP } from '../../../config/constants/constants';
import axios from 'axios';
import { Account } from '../../user/entites/account.entity';
import { TokenService } from './token-service';
import { UserService } from '../../user/user.service';
import {
    AssetType,
    TransactionStopInstance,
} from '../../blockchain-transactions/utils/transactionStopInstance';
import { RabbitTransactionService } from '../../../providers/rabbitmq/rabbitmq-tranaction.service';
import { EqHubService } from '../../../providers/web3/eqhub.service';
import { AccountGroup } from '../../user/entites/account-group.entity';
import { Web3Service } from '../../../providers/web3/v2/web3Service';

@Injectable()
export class TokenServiceImplV2 implements TokenService {
    constructor(
        private readonly eqbrService: EqHubService,
        @Inject('Web3Service') private readonly web3Service: Web3Service,
        private readonly userService: UserService,
        private readonly rabbitService: RabbitTransactionService,
    ) {}

    public async fillAmount(retryCount: number = APP.RETRY_COUNT): Promise<any> {
        return await this.executeFillAmount(retryCount);
    }

    private async executeFillAmount(retryCount: number) {
        try {
            return await this.eqbrService.sendFillAmountRequest();
        } catch (error) {
            return await this.retryFillAmount(retryCount);
        }
    }

    private async retryFillAmount(retryCount: number) {
        if (retryCount > APP.ZERO) {
            return await this.fillAmount(retryCount - APP.ONE);
        }
    }

    public async sendToken(groupId: number, isStop?: boolean): Promise<void> {
        if (isStop) {
            await this.rabbitService.sendTokenStopMessage(groupId);
            return;
        }
        if (TransactionStopInstance.isTransactionStopped(groupId)) {
            await this.userService.returnCoinAndToken(groupId);
            console.log('정지');
            return;
        }

        const accountGroup = await this.userService.findAccountGroup(groupId);
        const maxUserId = accountGroup.maxTokenUserId();

        if (accountGroup.maxTokenAccountZero()) {
            // await this.fillAmount();
            await this.userService.initTokenCharge(maxUserId);
            await this.eqbrService.initToken(accountGroup.maxTokenAccount());
        }
        const number = Math.floor(Math.random() * 100) + 1;
        let imp = number;
        const tokenAmount = accountGroup.minCoinAccount().token_amount;

        if (accountGroup.maxCoinAccount().token_amount === 10000 && -imp < 0) {
            imp = tokenAmount;
        }
        const toId = accountGroup.startTokenAccountId();

        await this.userService.transferToken(maxUserId, toId, imp);
        // console.log('보내는 사람의 계쩡', accountGroup.maxTokenAccount());

        const toAddress = await this.userService.findById(toId);
        let txHash = await this.web3Service.transferTokenToAdminOrAccount(
            accountGroup.maxTokenAccount(),
            toAddress.address,
        );

        for (let i = 0; i < 3; i++) {
            if (TransactionStopInstance.isTransactionStopped(groupId)) {
                // await this.userService.returnToken(groupId);
                // console.log('토큰 리턴하기');
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, APP.WAIT_TIME));
        }

        // let txHash = await this.eqbrService.sendEQBRToken(accountGroup.tokenToAddress(), imp);

        console.log(`✅ 토큰 전송 완료: groupId=${groupId}, hash=${txHash}`);
        await this.rabbitService.sendTokenMessage(groupId);
    }
}
