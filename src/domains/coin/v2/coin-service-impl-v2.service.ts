import { Inject, Injectable } from '@nestjs/common';
import { CoinService } from '../coin.service';
import { UserService } from '../../user/user.service';
import { Web3Service } from '../../../providers/web3/v2/web3Service';
import { TransactionStopInstance } from '../../blockchain-transactions/utils/transactionStopInstance';
import { RabbitTransactionService } from '../../../providers/rabbitmq/rabbitmq-tranaction.service';
import { Config } from '../../../config/environment/config';
import { APP } from '../../../config/constants/constants';
@Injectable()
export class CoinServiceImplV2 implements CoinService {
    constructor(
        @Inject('Web3Service') private readonly web3Service: Web3Service,
        private readonly userService: UserService,
        private readonly rabbitService: RabbitTransactionService,
    ) {}

    sendCoin(user: any, uuid: any, retryCount?: number): Promise<number> {
        throw new Error('Method not implemented.');
    }

    /**
     * 코인 전송 실행 (MQ 메시지를 통해 실행)
     * @param groupId 그룹 ID
     * @param isStop 중지 여부 (MQ에서 전달됨)
     */
    async sendCoin1(groupId: number, isStop?: boolean): Promise<void> {
        // 중지 요청 받았을때 종료 조건 -> 메소드를 중지하는 MQ요청을 보낸다
        if (isStop) {
            console.log('요청을 보낸다');
            await this.rabbitService.sendCoinStopMessage(groupId);
            return;
        }

        if (TransactionStopInstance.isTransactionStopped(groupId)) {
            await this.userService.returnCoinAndToken(groupId);
            return;
        }

        for (let i = 0; i < 3; i++) {
            if (TransactionStopInstance.isTransactionStopped(groupId)) {
                // await this.userService.returnCoinAndToken(groupId);
                console.log('코인 리언!!');
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, APP.WAIT_TIME));
        }
        const randomNumber = (Math.random() * (2 - 0.01) + 0.01).toFixed(2);

        const accountGroup = await this.userService.processCoinAccountGroup(
            groupId,
            Number(randomNumber),
        );

        const hash = await this.web3Service.transaction(
            accountGroup.coinFromAddress(),
            accountGroup.coinPrivateKey(),
            accountGroup.tokenToAddress(),
            randomNumber,
        );

        console.log(`✅ 코인 전송 완료: groupId=${groupId}, hash=${hash}`);

        this.rabbitService.sendCoinMessage(groupId);
    }
}
