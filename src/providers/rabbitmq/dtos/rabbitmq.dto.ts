import { MqProperty } from 'src/core/decorators/rabbitmq-property.decorator';

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
