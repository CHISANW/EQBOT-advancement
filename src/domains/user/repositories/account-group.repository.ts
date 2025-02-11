import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountGroup } from '../entites/account-group.entity';
import { Repository } from 'typeorm';
import { AccountRepository } from './account.repository';

@Injectable()
export class AccountGroupRepository {
    constructor(
        @InjectRepository(AccountGroup, 'connection1')
        private readonly accountGroupRepository: Repository<AccountGroup>,
        private readonly accountRepository: AccountRepository,
    ) {}

    async save(accountGroup: AccountGroup): Promise<AccountGroup> {
        return this.accountGroupRepository.save(accountGroup);
    }

    async deleteAccount(groupId: number) {
        await this.accountGroupRepository.delete(groupId);
    }
}
