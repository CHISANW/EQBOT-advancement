import { MqProperty } from 'src/core/decorators/rabbitmq-property.decorator';
import {
    AssetType,
    IsStopInstance,
} from '../../../domains/blockchain-transactions/utils/transactionStopInstance';

export class SampleCreateRmqDto {
    @MqProperty({
        type: 'number',
        description: 'Sample ID',
        required: true,
    })
    id: number;

    @MqProperty({
        type: 'string',
        description: 'Sample Name',
        required: true,
    })
    name: string;
}

export class BotTransaction {
    uuid: string;
    content: string;
}

export class BotFile {
    uuid: string;
    tx: string;
}

export class BotEmail {
    uuid: string;
    email: string;

    constructor(uuid?: string, email?: string) {
        this.uuid = uuid;
        this.email = email;
    }

    static of(uuid: string, email: string) {
        return new BotEmail(uuid, email);
    }
}

export class BotTransactionDto {
    group_id: number;

    transaction_type: string;

    isStop: boolean;

    constructor(group_id?: number, transaction_type?: string, isStop?: boolean) {
        this.group_id = group_id;
        this.transaction_type = transaction_type;
        this.isStop = isStop ?? false;
    }

    static coin(groupId: number, isStop?: boolean) {
        return new BotTransactionDto(groupId, 'COIN', isStop);
    }

    static token(groupId: number, isStop?: boolean) {
        return new BotTransactionDto(groupId, 'TOKEN', isStop);
    }
}

export class BotStopDto {
    group_id: number;
    isStopInstance: IsStopInstance;

    constructor(group_id: number, isStopInstance: IsStopInstance) {
        this.group_id = group_id;
        this.isStopInstance = isStopInstance;
    }

    static of(groupId: number, isStopInstance: IsStopInstance) {
        return new BotStopDto(groupId, isStopInstance);
    }

    static fromRawData(data: any): BotStopDto | null {
        if (!data?.group_id || !data?.isStopInstance) {
            console.error('Invalid data received:', data);
            return null;
        }

        const { group_id, isStopInstance } = data;

        const instance = new IsStopInstance(
            isStopInstance.isStop,
            isStopInstance.isToken ? AssetType.TOKEN : AssetType.COIN,
        );

        return new BotStopDto(group_id, instance);
    }
}
