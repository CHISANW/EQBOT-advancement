import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from '../../user/repositories/account.repository';
import axios from 'axios';
import { AxiosProvider } from '../../../providers/axios/axios-provider.service';
import { ViewService } from '../../../providers/view/view.service';
import { APP } from '../../../config/constants/constants';
import { Account } from '../../user/entites/account.entity';
import { RabbitmqService } from '../../../providers/rabbitmq/rabbitmq.service';

export interface TokenServiceV1 {
    fillAmount(): Promise<any>;

    sendToken(userId: number, amount: string, uuid: any, retryCount?: number): Promise<any>;
}

@Injectable()
export class TokenServiceImpl implements TokenServiceV1 {
    constructor(
        private readonly userRepository: AccountRepository,
        private readonly axiosProvider: AxiosProvider,
        @Inject('ViewService') private readonly viewService: ViewService,
        private readonly rabbitmqService: RabbitmqService,
    ) {}

    public async fillAmount(retryCount: number = APP.RETRY_COUNT): Promise<any> {
        return await this.executeFillAmount(retryCount);
    }

    private async executeFillAmount(retryCount: number) {
        try {
            return await this.sendFillAmountRequest();
        } catch (error) {
            return await this.retryFillAmount(retryCount);
        }
    }

    private async sendFillAmountRequest() {
        const response = await axios.post(
            this.axiosProvider.getFillAmountUrl(),
            this.axiosProvider.createFillBody(),
            {
                headers: AxiosProvider.getHeaders(),
            },
        );
        return response.data.transaction_hash;
    }

    private async retryFillAmount(retryCount: number) {
        if (retryCount > APP.ZERO) {
            return await this.fillAmount(retryCount - APP.ONE);
        }
    }

    public async sendToken(
        userId: number,
        amount: string,
        uuid: any,
        retryCount: number = APP.RETRY_COUNT,
    ): Promise<any> {
        const nextUserId = this.calculateNextUserId(userId);
        if (userId === 1) return;
        const user = await this.userRepository.findById(userId);
        return await this.executeCoinTransfer(user, amount, nextUserId, uuid, retryCount);
    }

    private calculateNextUserId(userId: number) {
        return userId === APP.LAST_USER_ID ? APP.ONE : userId + APP.ONE;
    }

    private async executeCoinTransfer(
        user: Account,
        amount: string,
        nextUserId: number,
        uuid: any,
        retryCount: number,
    ) {
        try {
            return await this.transferCoin(user, amount, nextUserId, uuid);
        } catch (error) {
            await this.handleExecutionReverted(error);
            return await this.retrySendToken(retryCount, user.user_id, amount, uuid);
        }
    }

    private async transferCoin(user: Account, amount: string, nextUserId: number, uuid: any) {
        let axiosResponse = await axios.post(
            this.axiosProvider.getTransferUrl(),
            this.axiosProvider.createTransferBody('user', amount),
            {
                headers: AxiosProvider.getHeaders(),
            },
        );
        this.viewService.logTransactionHash(axiosResponse.data.transaction_hash);
        // await this.rabbitmqService.publishFile(uuid, axiosResponse.data.transaction_hash);
        return await this.sendToken(nextUserId, amount, uuid);
    }

    private async handleExecutionReverted(error: any) {
        if (error.response.data.error.message === APP.EXECUTION_ERROR) {
            const hash = await this.fillAmount();
            this.viewService.rechargeToken(hash);
        }
    }

    private async retrySendToken(
        retryCount: number,
        nextUserId: number,
        amount: string,
        uuid: any,
    ) {
        if (retryCount > APP.ZERO) {
            await new Promise((resolve) => setTimeout(resolve, APP.WAIT_TIME));
            return await this.sendToken(nextUserId, amount, uuid, retryCount - APP.ONE);
        }
    }
}
