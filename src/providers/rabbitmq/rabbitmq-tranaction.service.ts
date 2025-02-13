import { Injectable } from '@nestjs/common';
import { RabbitmqProduceService } from './rabbitmq-produce.service';
import { PRODUCE_BIND } from './constants/produce-bind.constants';
import { BotStopDto, BotTransactionDto } from './dtos/rabbitmq.dto';
import {
    AssetType,
    TransactionStopInstance,
} from '../../domains/blockchain-transactions/utils/transactionStopInstance';

@Injectable()
export class RabbitTransactionService extends RabbitmqProduceService {
    async sendCoinMessage(groupId: number) {
        super.sendMessage(PRODUCE_BIND.BOT_TRANSACTION, BotTransactionDto.coin(groupId));
    }

    async sendTokenMessage(groupId: number) {
        super.sendMessage(PRODUCE_BIND.BOT_TRANSACTION, BotTransactionDto.token(groupId));
    }

    async sendCoinStopMessage(groupId: number) {
        super.sendMessage(
            PRODUCE_BIND.BOT_STOP,
            BotStopDto.of(groupId, TransactionStopInstance.set(groupId, true, AssetType.COIN)),
        );
    }

    async sendTokenStopMessage(groupId: number) {
        super.sendMessage(
            PRODUCE_BIND.BOT_STOP,
            BotStopDto.of(groupId, TransactionStopInstance.set(groupId, true, AssetType.TOKEN)),
        );
    }

    async sendAllStopMessage(groupId: number) {
        this.sendCoinStopMessage(groupId);
        this.sendTokenStopMessage(groupId);
    }

    async sendAllExecuteMessage(groupId: number) {
        await super.sendMessage(PRODUCE_BIND.BOT_TRANSACTION, BotTransactionDto.coin(groupId));
        await super.sendMessage(PRODUCE_BIND.BOT_TRANSACTION, BotTransactionDto.token(groupId));
    }
}
