import { Inject, Injectable } from '@nestjs/common';
import { AccountRepository } from './repositories/account.repository';
import { Account } from './entites/account.entity';
import { AccountGroupRepository } from './repositories/account-group.repository';
import { AccountGroup } from './entites/account-group.entity';
import { Web3Service } from '../../providers/web3/v2/web3Service';

@Injectable()
export class UserService {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly accountGroupRepository: AccountGroupRepository,
        @Inject('Web3Service') private readonly webService: Web3Service,
    ) {}

    /*
    사용자를 생성후에 DB에 저장한다.
     */
    async createAccounts(accountCount: number): Promise<any> {
        const accounts = await this.webService.createAccounts(accountCount);

        const newVar = await Promise.all(
            accounts.map((account) =>
                this.accountRepository.save(Account.of(account.address, account.privateKey)),
            ),
        );

        return newVar;
    }

    /*
    실질적으로 트랜잭션 실행시 그룹을 만들어서 실행되는 함수
     */
    async createAccountGroup(accountCount: number): Promise<number> {
        let accounts =
            await this.accountRepository.findUserNotMappingGroupByAccountCount(accountCount);

        const missingCount = accountCount - accounts.length;

        if (missingCount > 0) {
            const newAccounts = await this.createAccounts(missingCount);
            accounts = accounts.concat(newAccounts); // 기존 계정 + 새 계정을 합침
        }

        return await this.accountGroupRepository
            .save(AccountGroup.of(accounts, accountCount))
            .then((result) => result.id);
    }

    async totalCount(): Promise<number> {
        return await this.accountRepository.totalCount();
    }

    async findUsers(formUserId: number, toUserId: number) {
        const from = await this.accountRepository.findById(formUserId);
        const to = await this.accountRepository.findById(toUserId);
        return { from, to };
    }

    async processCoinAccountGroup(groupId: number) {
        const accountGroup = await this.findAccountGroup(groupId);
        const maxUserId = accountGroup.maxCoinUserId();
        if (accountGroup.maxCoinAccountZero()) {
            await this.initCoinCharge(maxUserId);
        }
        await this.transferCoin(maxUserId, accountGroup.startCoinAccountId(), 1);
        return accountGroup;
    }

    async processTokenAccountGroup(groupId: number) {
        const accountGroup = await this.findAccountGroup(groupId);
        const maxUserId = accountGroup.maxCoinUserId();
        if (accountGroup.maxCoinAccountZero()) {
            await this.initCoinCharge(maxUserId);
        }
        await this.transferCoin(maxUserId, accountGroup.startCoinAccountId(), 1);
        return accountGroup;
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

    // 마지막 아이디 가져오기
    async getlastId() {
        return await this.accountGroupRepository.findAccountGroupLastId();
    }
    async softDeleteAccount(groupId: number) {
        await this.accountGroupRepository.deleteAccount(groupId);
        await this.accountRepository.softDeleteAccount(groupId);
    }

    async findAccountGroup(groupId: number): Promise<AccountGroup> {
        return this.accountGroupRepository.findAccountGroup(groupId);
    }

    async updateAdminCoinTransaction(amount: number, type: boolean) {
        await this.accountRepository.updateCoinTransaction(amount, type);
    }

    async updateAdminTokenTransaction(amount: number, type: boolean) {
        await this.accountRepository.updateTokenTransaction(amount, type);
    }

    async initCoinCharge(toAccountId: number) {
        await this.accountRepository.chargeCoin(toAccountId, 10);
        await this.updateAdminCoinTransaction(10, true); // 입금
    }

    async transferCoin(fromAccountId: number, toAccountId: number, amount: number) {
        await this.accountRepository.chargeCoin(toAccountId, amount); // 수신자에게 토큰 충전
        await this.accountRepository.reduceCoin(fromAccountId, amount); // 발신자는 토큰 감소
    }

    async initTokenCharge(toAccountId: number) {
        await this.accountRepository.chargeToken(toAccountId, 10000);
        await this.updateAdminTokenTransaction(10000, true); // 입금
    }

    async transferToken(fromAccountId: number, toAccountId: number, amount: number) {
        await this.accountRepository.chargeToken(toAccountId, amount); // 수신자에게 토큰 충전
        await this.accountRepository.reduceToken(fromAccountId, amount); // 발신자는 토큰 감소
    }

    async initGroupIds() {
        return await this.accountGroupRepository.findInitGroupIds();
    }
}
