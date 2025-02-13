import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { BotStopDto } from '../../../providers/rabbitmq/dtos/rabbitmq.dto';
import { BlockService } from '../block-service';
import { BlockDto } from './dtos/block-dto';
import { RabbitTransactionService } from '../../../providers/rabbitmq/rabbitmq-tranaction.service';

@Injectable()
export class BlockServiceImplV2 implements BlockService {
    constructor(
        private readonly userService: UserService,
        private readonly rabbitService: RabbitTransactionService,
    ) {}

    async transactionSoftDelete(botStopDto: BotStopDto) {
        if (botStopDto.isStopInstance.isSafe())
            await this.userService.softDeleteAccount(botStopDto.group_id);
    }

    async stopSendMQ() {
        await this.rabbitService.sendAllStopMessage(await this.userService.getlastId());
    }

    async generateTransactions(blockDto: BlockDto) {
        const groupId = await this.userService.createAccountGroup(blockDto.accountCount);
        await this.rabbitService.sendAllExecuteMessage(groupId);
    }
}
