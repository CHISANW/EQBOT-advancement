import { Injectable, OnModuleInit } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { RabbitTransactionService } from '../../../providers/rabbitmq/rabbitmq-tranaction.service';

@Injectable()
export class testService implements OnModuleInit {
    constructor(
        private readonly userService: UserService,
        private readonly rabbitService: RabbitTransactionService,
    ) {}
    async onModuleInit() {
        console.log('🚀 서비스가 자동 실행됩니다!');
        await this.runStartupLogic();
    }

    private async runStartupLogic() {
        const initGroupIds = await this.userService.initGroupIds();
        for (const groupId of initGroupIds) await this.rabbitService.sendAllExecuteMessage(groupId);
    }
}
