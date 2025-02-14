import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { BotStopDto } from '../../../providers/rabbitmq/dtos/rabbitmq.dto';
import { BlockService } from '../block-service';
import { BlockDto } from './dtos/block-dto';
import { RabbitTransactionService } from '../../../providers/rabbitmq/rabbitmq-tranaction.service';
import { Web3Service } from '../../../providers/web3/v2/web3Service';
import { Account } from '../../user/entites/account.entity';

@Injectable()
export class BlockServiceImplV2 implements BlockService {
    constructor(
        private readonly userService: UserService,
        @Inject('Web3Service') private readonly web3Service: Web3Service,
        private readonly rabbitService: RabbitTransactionService,
    ) {}

    async transactionSoftDelete(botStopDto: BotStopDto) {
        if (botStopDto.isStopInstance.isSafe()) {
            await this.userService.returnCoinAndToken(botStopDto.group_id);
            await this.userService.softDeleteAccount(botStopDto.group_id);
        }
    }

    async stopSendMQ() {
        try {
            const groupId = await this.userService.getLastGroupId();
            await this.userService.updateIsDeleted();
            const accountGroup = await this.userService.findAccountGroup(groupId);

            const accounts: Account[] = accountGroup.accounts;

            for (let account of accounts) {
                await this.web3Service.transferTokenToAdminOrAccount(account);
            }

            await this.rabbitService.sendAllStopMessage(groupId);
        } catch (err) {
            console.log('반환주 오류', err);
        }
    }

    async generateTransactions(blockDto: BlockDto) {
        const groupId = await this.userService.createAccountGroup(blockDto.accountCount);
        await this.rabbitService.sendAllExecuteMessage(groupId);
    }
}
