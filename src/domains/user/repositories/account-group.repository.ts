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

    async updateIsDeleted() {
        return this.accountGroupRepository.query(
            `
           UPDATE account_group AS ag
            JOIN (
                SELECT id FROM account_group ORDER BY id DESC LIMIT 1
            ) AS sub ON ag.id = sub.id
            SET ag.isDeleted = true;
            `,
        );
    }
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
            where: { isDeleted: false },
            take: 1, // 최신 1개만 가져옴
        });

        return accountGroups.length > 0 ? accountGroups[0].id : null;
    }

    async findInitGroupIds(): Promise<number[]> {
        const accountGroups = await this.accountGroupRepository.find({
            select: ['id'],
            where: { isDeleted: false },
        });
        return accountGroups.map((group) => group.id);
    }

    async findDeleteIds() {
        const accountDeleteGroups = await this.accountGroupRepository.find({
            select: ['id'],
            where: { isDeleted: true },
        });
        return accountDeleteGroups.map((group) => group.id);
    }
}
