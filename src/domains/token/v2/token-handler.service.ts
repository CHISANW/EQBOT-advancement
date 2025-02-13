import { TransactionHandler } from '../../blockchain-transactions/handler/TransactionHandler';
import { Inject, Injectable } from '@nestjs/common';
import { TokenService } from './token-service';

@Injectable()
export class TokenTransactionHandler implements TransactionHandler {
    constructor(@Inject('TokenService') private readonly tokenService: TokenService) {}

    //todo 마지막에 주석제거하기
    async handleTransaction(data: any): Promise<void> {
        const { group_id, isStop } = data;
        await this.tokenService.sendToken(group_id, isStop);
    }
}
