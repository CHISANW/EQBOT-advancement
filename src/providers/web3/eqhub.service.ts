import { Inject, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
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

    public async sendFillAmountRequest() {
        const response = await axios.post(
            this.axiosProvider.getFillAmountUrl(),
            this.axiosProvider.createFillBody(),
            {
                headers: AxiosProvider.getHeaders(),
            },
        );
        return response.data.transaction_hash;
    }

    public async sendEQBRToken(toAddress: string, retryCount: number = 3): Promise<any> {
        try {
            const axiosResponse = await axios.post(
                this.axiosProvider.getTransferUrl(),
                this.axiosProvider.createTransferBody(toAddress, '100'),
                {
                    headers: AxiosProvider.getHeaders(),
                },
            );
            if (axiosResponse.data.transaction_hash === undefined) {
                throw new Error('값이 없음');
            }
            return axiosResponse.data.transaction_hash;
        } catch (error) {
            if (retryCount > 0) {
                await new Promise((resolve) => setTimeout(resolve, 5000));
                return this.sendEQBRToken(toAddress, retryCount - 1);
            }
            throw error;
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
