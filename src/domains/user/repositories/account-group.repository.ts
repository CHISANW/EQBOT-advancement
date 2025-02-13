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

    async findAccountGroup(groupId: number): Promise<AccountGroup> {
        return this.accountGroupRepository.findOne({
            where: { id: groupId },
            relations: ['accounts'], // accounts 필드까지 조회
        });
    }

    async findAccountGroupLastId(): Promise<number> {
        const accountGroups = await this.accountGroupRepository.find({
            order: { id: 'DESC' },
            take: 1, // 최신 1개만 가져옴
        });

        return accountGroups.length > 0 ? accountGroups[0].id : null;
    }

    async findInitGroupIds(): Promise<number[]> {
        const accountGroups = await this.accountGroupRepository.find({
            select: ['id'],
        });
        return accountGroups.map((group) => group.id);
    }
}
