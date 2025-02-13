import { TransactionHandler } from '../../blockchain-transactions/handler/TransactionHandler';
import { CoinService } from '../coin.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CoinTransactionHandler implements TransactionHandler {
    constructor(@Inject('CoinService') private readonly coinService: CoinService) {}

    async handleTransaction(data: any): Promise<void> {
        const { group_id, isStop } = data;
        await this.coinService.sendCoin1(group_id, isStop);
    }
}
