import { Injectable } from '@nestjs/common';
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

@Injectable()
export class TokenServiceImplV2 implements TokenService {
    constructor(
        private readonly eqbrService: EqHubService,
        private readonly userRepository: AccountRepository,
        private readonly axiosProvider: AxiosProvider,
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
        if (isStop) return;
        if (TransactionStopInstance.isTransactionStopped(groupId)) {
            await this.rabbitService.sendTokenStopMessage(groupId);
            return;
        }

        const accountGroup = await this.userService.findAccountGroup(groupId);
        const maxUserId = accountGroup.maxTokenUserId();

        if (accountGroup.maxTokenAccountZero()) {
            await this.fillAmount();
            await this.userService.initTokenCharge(maxUserId);
        }
        await this.userService.transferToken(maxUserId, accountGroup.startTokenAccountId(), 100);

        for (let i = 0; i < 3; i++) {
            if (TransactionStopInstance.isTransactionStopped(groupId)) return;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        await this.successTx(groupId, accountGroup);
    }

    private async successTx(groupId: number, accountGroup: AccountGroup) {
        if (TransactionStopInstance.isTransactionSuccess(groupId)) {
            let txHash = await this.eqbrService.sendEQBRToken(accountGroup.tokenToAddress());
            console.log(`✅ 토큰 전송 완료: groupId=${groupId}, hash=${txHash}`);
            await this.rabbitService.sendTokenMessage(groupId);
        }
    }
}
