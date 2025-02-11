import { Config } from '../../../config/environment/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../../domains/user/entites/account.entity';
import { AccountGroup } from '../../../domains/user/entites/account-group.entity';

export const MYSQL = {
    CONNECTION1: {
        ...Config.getEnvironment().DB_1,
        entities: [Account, AccountGroup],
        synchronize: Config.getEnvironment().NODE_ENV !== 'production',
        timezone: 'Z',
        // logging: true,
    },
};

export const MYSQL_CONNECTION = [
    {
        name: 'connection1',
        connection: MYSQL.CONNECTION1,
    },
];

export const TypeOrmModules = MYSQL_CONNECTION.map((mySqlConnection) =>
    TypeOrmModule.forRootAsync({
        name: mySqlConnection.name,
        useFactory: () => mySqlConnection.connection,
    }),
);
