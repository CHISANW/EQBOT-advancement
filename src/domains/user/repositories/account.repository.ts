import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entites/account.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class AccountRepository {
    constructor(
        @InjectRepository(Account, 'connection1')
        private readonly accountRepository: Repository<Account>,
    ) {}

    async save(account: Account, transaction?: EntityManager): Promise<Account> {
        if (transaction) {
            return transaction.getRepository(Account).save(account);
        }
        return this.accountRepository.save(account);
    }

    async findById(userId: number, transaction?: EntityManager): Promise<Account> {
        return transaction
            ? await transaction.getRepository(Account).findOneOrFail({ where: { user_id: userId } })
            : await this.accountRepository.findOneOrFail({ where: { user_id: userId } });
    }

    async deleteTenAccounts() {
        await this.accountRepository.query(`
            DELETE a FROM account a
        JOIN (
            SELECT user_id FROM account
            WHERE role = 'user'
            ORDER BY user_id DESC
            LIMIT 10
        ) AS subquery ON a.user_id = subquery.user_id;
        `);
    }

    async totalCount() {
        return await this.accountRepository.count();
    }

    async maxAmountUser() {
        return await this.accountRepository
            .createQueryBuilder('account')
            .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('MAX(account.amount)')
                    .where('account.role = :role', { role: 'user' })
                    .from('account', 'account')
                    .getQuery();
                return 'account.amount = ' + subQuery;
            })
            .getOne();
    }

    async minAmountUser() {
        return await this.accountRepository
            .createQueryBuilder('account')
            .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('MIN(account.amount)')
                    .where('account.role = :role', { role: 'user' })
                    .from('account', 'account')
                    .getQuery();
                return 'account.amount = ' + subQuery;
            })
            .getOne();
    }

    /**
     * 한번의 컬럼을 만들기위해서 Account의 계정의 수를 선택하여 실행할 컬럼을 생성
     */
    async findUserNotMappingGroupByAccountCount(userCount?: number) {
        return await this.accountRepository
            .createQueryBuilder('account')
            .where('accountGroupId IS NULL')
            .orderBy('account.created_at', 'ASC')
            .limit(userCount ?? 10)
            .getMany();
    }

    async softDeleteAccount(groupId: number) {
        await this.accountRepository
            .createQueryBuilder()
            .update(Account)
            .set({ accountGroup: null })
            .where('accountGroupId = :groupId', { groupId })
            .execute();
    }

    /*
     type = true 출금\
     type = false 입금
     */
    async updateCoinTransaction(amount: number, type: boolean) {
        const coinTransactionQuery = type ? `coin_amount - ${amount}` : `coin_amount + ${amount}`;
        return await this.accountRepository
            .createQueryBuilder()
            .update(Account)
            .set({ coin_amount: () => coinTransactionQuery })
            .where('role = :role', { role: 'admin' })
            .execute();
    }

    async chargeCoin(toAccountId: number, amount: number) {
        return await this.accountRepository.query(`
        UPDATE account set coin_amount = account.coin_amount + ${amount} where user_id = ${toAccountId}
        `);
    }

    async reduceCoin(fromAccountId: number, amount: number) {
        return await this.accountRepository.query(`
        UPDATE account set coin_amount = account.coin_amount - ${amount} where user_id = ${fromAccountId}
        `);
    }

    /*
   type = true 출금\
   type = false 입금
   */
    async updateTokenTransaction(amount: number, type: boolean) {
        const tokenTransactionQuery = type
            ? `token_amount - ${amount}`
            : `token_amount + ${amount}`;
        return await this.accountRepository
            .createQueryBuilder()
            .update(Account)
            .set({ token_amount: () => tokenTransactionQuery })
            .where('role = :role', { role: 'admin' })
            .execute();
    }

    async chargeToken(toAccountId: number, amount: number) {
        return await this.accountRepository.query(`
        UPDATE account set token_amount = account.token_amount + ${amount} where user_id = ${toAccountId}
        `);
    }

    async reduceToken(fromAccountId: number, amount: number) {
        return await this.accountRepository.query(`
        UPDATE account set token_amount = account.token_amount - ${amount} where user_id = ${fromAccountId}
        `);
    }
}
