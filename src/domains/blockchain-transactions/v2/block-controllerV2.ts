import { Body, Controller, DefaultValuePipe, Delete, Inject, Post } from '@nestjs/common';
import { RabbitmqSubscribe } from '../../../core/decorators/rabbitmq.decorator';
import { BlockService } from '../block-service';
import { BlockDto } from './dtos/block-dto';
import { TransactionHandlerFactory } from '../handler/transaction-handler-factory';
import { BotStopDto, BotTransactionDto } from '../../../providers/rabbitmq/dtos/rabbitmq.dto';
import { Web3Service } from '../../../providers/web3/v2/web3Service';

@Controller('block')
export class BlockControllerV2 {
    constructor(
        @Inject('BlockService') private readonly blockService: BlockService,
        @Inject('Web3Service') private readonly webService: Web3Service,
        private readonly transactionHandlerFactory: TransactionHandlerFactory,
    ) {}

    @Post()
    async executeBotTransactions(@Body(new DefaultValuePipe(BlockDto.init)) blockDto: BlockDto) {
        await this.blockService.generateTransactions(blockDto);
        return {
            success: true,
            message: 'SUCCESS BOT',
        };
    }

    @Delete('/account')
    async testDelete() {
        this.blockService.stopSendMQ();
        return 'ok';
    }

    @RabbitmqSubscribe('BOT-TRANSACTION', 1)
    async handleBotTransaction(data: any) {
        const handler = this.transactionHandlerFactory.getHandler(data.transaction_type);
        await handler.handleTransaction(data);
    }

    @RabbitmqSubscribe('BOT-STOP', 1)
    async handleBotStop(data: any) {
        await this.blockService.transactionSoftDelete(BotStopDto.fromRawData(data));
    }

    @Post('tt')
    async testtt() {
        // this.webService.transferTokenToAdmin();
    }
}
