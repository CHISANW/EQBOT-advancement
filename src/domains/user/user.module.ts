import { forwardRef, Module } from '@nestjs/common';
import { AccountRepository } from './repositories/account.repository';
import { Account } from './entites/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { AccountGroup } from './entites/account-group.entity';
import { AccountGroupRepository } from './repositories/account-group.repository';
import { Web3Module } from '../../providers/web3/web3.module';

@Module({
    imports: [
        forwardRef(() => Web3Module),
        TypeOrmModule.forFeature([Account, AccountGroup], 'connection1'),
    ],
    controllers: [],
    providers: [AccountRepository, AccountGroupRepository, UserService],
    exports: [AccountRepository, UserService],
})
export class UserModule {}
