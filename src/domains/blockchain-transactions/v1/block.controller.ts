import { Controller, DefaultValuePipe, Inject, Param, Post, Query } from '@nestjs/common';
import { BlockServiceImplV1 } from './block-service-impl.service';
import { Cron } from '@nestjs/schedule';
import { RabbitmqSubscribe } from '../../../core/decorators/rabbitmq.decorator';
import { Web3ServiceV1 } from '../../../providers/web3/v1/web3-service-v1.service';
import { BlockService } from '../block-service';

@Controller('block')
export class BlockController {
    constructor(
        @Inject('BlockService') private readonly blockService: BlockService,
        private readonly webService: Web3ServiceV1,
    ) {}

    @Post()
    @Cron('0 */30 * * * *')
    executeBotTransactions(
        @Query('amount', new DefaultValuePipe('100')) amount: string,
        @Query('iteration', new DefaultValuePipe(0)) iteration: number,
        @Query('email', new DefaultValuePipe(null)) email: string,
    ) {
        this.blockService.generateRandomTransactions(iteration, amount, email);
        return {
            success: true,
            message: 'SUCCESS BOT',
        };
    }

    @Post('create')
    testCreate() {
        this.webService.createAccounts();
    }

    @RabbitmqSubscribe('BOT-TRANSACTION', 3)
    async test1(data: any) {
        console.log('dataaaaa', data.uuid);
    }

    @RabbitmqSubscribe('BOT-EMAIL', 3)
    async subEmail(data: any) {
        console.log('구독하기?');
        console.log('데이터추출', data);
        const dto = { ...data };
        console.log('스프레드', dto);
    }
}
