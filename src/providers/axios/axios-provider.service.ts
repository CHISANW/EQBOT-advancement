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
        return `${Config.getEnvironment().EQ_API}/v1/token-kits/kits/13/transfers/transfer?accountId=${Config.getEnvironment().ACCOUNT_ID}`;
    }

    getFillAmountUrl() {
        return `${Config.getEnvironment().EQ_API}/v1/token-kits/kits/13/issuances/issue?accountId=${Config.getEnvironment().ACCOUNT_ID}`;
    }

    getTransactionReceiptUrl(hash: string) {
        return `/v2/request/transaction/${hash}/receipt?microChainId=43161`;
    }

    createTransferBody(user: Account, amount: string) {
        return {
            transferObjects: [
                {
                    recipientAddress: 'user.meta_address',
                    amount: amount,
                },
            ],
        };
    }

    createFillBody() {
        return {
            issuanceObjects: [
                {
                    recipientAddress: Config.getEnvironment().META_ADDRESS,
                    amount: '1000000000000000000',
                },
            ],
        };
    }
}
