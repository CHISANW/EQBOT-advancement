import { BlockDto } from './v2/dtos/block-dto';
import { BotStopDto } from '../../providers/rabbitmq/dtos/rabbitmq.dto';

export interface BlockService {
    generateTransactions(blockDto: BlockDto): Promise<void>;

    stopSendMQ();

    transactionSoftDelete(botStopDto: BotStopDto);
}
