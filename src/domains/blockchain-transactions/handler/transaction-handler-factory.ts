import { Injectable, Inject } from '@nestjs/common';
import { TransactionHandler } from './TransactionHandler';
import { CoinTransactionHandler } from '../../coin/v2/coin-transcation.service';
import { TokenTransactionHandler } from '../../token/v2/token-handler.service';

@Injectable()
export class TransactionHandlerFactory {
    private readonly handlers: Record<string, TransactionHandler>;

    constructor(
        private readonly coinTransactionHandler: CoinTransactionHandler,
        private readonly tokenTransactionHandler: TokenTransactionHandler,
    ) {
        this.handlers = {
            COIN: this.coinTransactionHandler,
            TOKEN: this.tokenTransactionHandler,
        };
    }

    getHandler(type: string): TransactionHandler {
        return this.handlers[type];
    }
}
