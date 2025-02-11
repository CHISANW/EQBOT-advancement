import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { AxiosProvider } from '../axios/axios-provider.service';
import { ViewService } from '../view/view.service';
import { APP } from '../../config/constants/constants';

type RequestCallBody = {
    to: string;
    data?: string;
    from?: string;
    gas?: string;
    gasPrice?: string;
    value?: string;
};

@Injectable()
export class EqHubService {
    constructor(
        @Inject('EQ_HUB_API') private readonly eqHubApi: AxiosInstance,
        private readonly axiosProvider: AxiosProvider,
        @Inject('ViewService') private readonly viewService: ViewService,
    ) {}

    async getTransactionReceipt(
        txHash: string,
        retryCount: number = APP.RETRY_COUNT,
    ): Promise<any> {
        try {
            const axiosResponse = await this.handlerReceipt(txHash);
            this.viewService.logPollingHash(axiosResponse.data.receipt.transactionHash);
            return axiosResponse;
        } catch (error) {
            return await this.retryTransactionReceipt(retryCount, txHash);
        }
    }

    private async handlerReceipt(txHash: string) {
        const headers = AxiosProvider.getHeaders();

        return await this.eqHubApi.get(this.axiosProvider.getTransactionReceiptUrl(txHash), {
            headers: headers,
        });
    }

    private async retryTransactionReceipt(retryCount: number, txHash: string) {
        if (retryCount > 0) {
            await new Promise((resolve) => setTimeout(resolve, APP.WAIT_TIME));
            return await this.getTransactionReceipt(txHash, retryCount - 1); // 재시도
        }
    }
}
