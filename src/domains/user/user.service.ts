import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from './repositories/account.repository';
import { Account } from './entites/account.entity';
import { AccountGroupRepository } from './repositories/account-group.repository';
import { AccountGroup } from './entites/account-group.entity';

@Injectable()
export class UserService {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly accountGroupRepository: AccountGroupRepository,
    ) {}

    async save(accounts: any[]): Promise<Account[]> {
        const a: Account[] = [];
        for (const account of accounts) {
            const { address, privateKey } = account;
            a.push(await this.accountRepository.save(Account.of(address, privateKey)));
        }
        return a;
    }

    async group(count?: number): Promise<boolean> {
        let accounts: Account[] = await this.accountRepository.findUserNotMappingGroup(count);
        if (accounts.length < count) {
            console.log('그룹화할 유저가 없습니다.');
            return false;
        }

        await this.accountGroupRepository.save(AccountGroup.of(accounts, count));
        return true;
    }

    async totalCount(): Promise<number> {
        return await this.accountRepository.totalCount();
    }

    async findUsers(formUserId: number, toUserId: number) {
        const from = await this.accountRepository.findById(formUserId);
        const to = await this.accountRepository.findById(toUserId);
        return { from, to };
    }

    async deleteTenAccounts(): Promise<void> {
        await this.accountRepository.deleteTenAccounts();
    }

    async findMaxAmountUser() {
        return await this.accountRepository.maxAmountUser();
    }

    async findMinAmountUser() {
        return await this.accountRepository.minAmountUser();
    }

    async softDeleteAccount(groupId: number) {
        this.accountGroupRepository.deleteAccount(groupId);
        await this.accountRepository.softDeleteAccount(groupId);
    }
}
