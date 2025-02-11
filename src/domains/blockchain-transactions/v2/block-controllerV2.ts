import { Controller, DefaultValuePipe, Delete, Inject, Param, Post, Query } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RabbitmqSubscribe } from '../../../core/decorators/rabbitmq.decorator';
import { BlockService } from '../block-service';
import { Web3ServiceV1 } from '../../../providers/web3/v1/web3-service-v1.service';

@Controller('block')
export class BlockControllerV2 {
    constructor(
        @Inject('BlockService') private readonly blockService: BlockService,
        @Inject('Web3Service') private readonly webService: Web3ServiceV1,
    ) {}

    @Post()
    @Cron('0 */30 * * * *')
    executeBotTransactions(
        @Query('amount', new DefaultValuePipe('100')) amount: string,
        @Query('iteration', new DefaultValuePipe(0)) iteration: number,
        @Query('email', new DefaultValuePipe(null)) email: string,
        @Query('groupId', new DefaultValuePipe(0)) groupId: number,
        @Query('count', new DefaultValuePipe(10)) count: number,
    ) {
        // this.blockService.generateRandomTransactions(iteration, amount, email);
        this.blockService.testMQ(groupId, count);
        return {
            success: true,
            message: 'SUCCESS BOT',
        };
    }

    @Post('/account')
    testCreate() {
        this.webService.createAccounts();
    }

    @Delete('/account')
    testDelete() {
        this.webService.deleteAccount();
    }

    @RabbitmqSubscribe('BOT-TRANSACTION', 3)
    async test1(data: any) {
        console.log(data);
    }

    @RabbitmqSubscribe('BOT-EMAIL', 3)
    async subEmail(data: any) {
        console.log('구독하기?');
        console.log('데이터추출', data);
        const dto = { ...data };
        console.log('스프레드', dto);
    }
}
