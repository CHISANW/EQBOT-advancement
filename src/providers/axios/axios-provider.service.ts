import { Injectable } from '@nestjs/common';
import { Config } from '../../config/environment/config';
import { Account } from '../../domains/user/entites/account.entity';

@Injectable()
export class AxiosProvider {
    static getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-eq-ag-api-key': Config.getEnvironment().EQHUB_KEY,
        };
    }

    getTransferUrl() {
        return `${Config.getEnvironment().EQ_API}/v1/token-kits/kits/20/transfers/transfer?accountId=${Config.getEnvironment().ACCOUNT_ID}`;
    }

    getFillAmountUrl() {
        return `${Config.getEnvironment().EQ_API}/v1/token-kits/kits/20/issuances/issue?accountId=${Config.getEnvironment().ACCOUNT_ID}`;
    }

    getTransactionReceiptUrl(hash: string) {
        return `/v2/request/transaction/${hash}/receipt?microChainId=43161`;
    }

    createTransferBody(address: string, amount: string) {
        return {
            secretKey:
                'rXjOkjliAaORC7pZ5W-4sXJnJjYpI29zf_5QtjgvJxCpZcbT_-OWO1Mh_n67Er57fajUuz-W6sGT9m6CYSYluw',
            password: '000000',
            transferObjects: [
                {
                    recipientAddress: address,
                    amount: amount,
                },
            ],
        };
    }

    createFillBody() {
        return {
            secretKey:
                'rXjOkjliAaORC7pZ5W-4sXJnJjYpI29zf_5QtjgvJxCpZcbT_-OWO1Mh_n67Er57fajUuz-W6sGT9m6CYSYluw',
            password: '000000',
            issuanceObjects: [
                {
                    recipientAddress: Config.getEnvironment().META_ADDRESS,
                    amount: '1000000000000000000',
                },
            ],
        };
    }
}
