import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entites/account.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { log } from 'winston';

@Injectable()
export class AccountRepository {
    constructor(
        @InjectRepository(Account, 'connection1')
        private readonly accountRepository: Repository<Account>,
        @InjectDataSource('connection1')
        private readonly connection1: DataSource,
    ) {}

    async returnCoinAndToken(coin: number, token: number) {
        await this.connection1.transaction(async (manager) => {
            await manager.query(
                `
                UPDATE account
                SET coin_amount = coin_amount + ?,
                    token_amount = token_amount + ?
                WHERE user_id = ?
                `,
                [coin, token, 1],
            );
        });
    }

    async resetCoinAndToken(groupId: number) {
        await this.accountRepository.query(
            `
            UPDATE account
                SET token_amount = 0,
                    coin_amount = 0
                WHERE accountGroupId = ?
            `,
            [groupId],
        );
    }

    async sumTokenAmount(groupId: number) {
        return await this.connection1.transaction(async (manager) => {
            const result = await manager.query(
                `SELECT SUM(token_amount) AS totalTokenAmount FROM account WHERE accountGroupId = ?`,
                [groupId],
            );
            return result[0]?.totalTokenAmount || 0;
        });
    }

    async sumCoinAmount(groupId: number) {
        return await this.connection1.transaction(async (manager) => {
            const result = await manager.query(
                `SELECT SUM(coin_amount) AS totalCoinAmount FROM account WHERE accountGroupId = ?`,
                [groupId],
            );
            return result[0]?.totalCoinAmount || 0;
        });
    }

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

    async findByGroupId(groupId: number) {
        return this.accountRepository.findOne({ where: { accountGroup: { id: groupId } } });
    }

    async deleteTenAccounts() {
        await this.connection1.transaction(async (manager) => {
            await manager.query(`
                DELETE a FROM account a
                JOIN (
                    SELECT user_id FROM account
                    WHERE role = 'user'
                    ORDER BY user_id DESC
                    LIMIT 10
                ) AS subquery ON a.user_id = subquery.user_id;
            `);
        });
    }

    async totalCount() {
        return await this.connection1.transaction(async (manager) => {
            return await manager.getRepository(Account).count();
        });
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
        await this.connection1.transaction(async (manager) => {
            await manager
                .createQueryBuilder()
                .update(Account)
                .set({ accountGroup: null })
                .where('accountGroupId = :groupId', { groupId })
                .execute();
        });
    }

    /*
     type = true 출금\
     type = false 입금
     */
    async updateCoinTransaction(amount: number, type: boolean) {
        const coinTransactionQuery = type ? `coin_amount - ${amount}` : `coin_amount + ${amount}`;
        return await this.connection1.transaction(async (manager) => {
            await manager
                .createQueryBuilder()
                .update(Account)
                .set({ coin_amount: () => coinTransactionQuery })
                .where('role = :role', { role: 'admin' })
                .execute();
        });
    }
    async chargeCoin(toAccountId: number, amount: number) {
        return await this.connection1.transaction(async (manager) => {
            await manager.query(`
                UPDATE account set coin_amount = account.coin_amount + ${amount} where user_id = ${toAccountId}
            `);
        });
    }

    async reduceCoin(fromAccountId: number, amount: number) {
        return await this.connection1.transaction(async (manager) => {
            await manager.query(`
                UPDATE account set coin_amount = account.coin_amount - ${amount} where user_id = ${fromAccountId}
            `);
        });
    }

    /*
   type = true 출금\
   type = false 입금
   */
    async updateTokenTransaction(amount: number, type: boolean) {
        const tokenTransactionQuery = type
            ? `token_amount - ${amount}`
            : `token_amount + ${amount}`;
        return await this.connection1.transaction(async (manager) => {
            await manager
                .createQueryBuilder()
                .update(Account)
                .set({ token_amount: () => tokenTransactionQuery })
                .where('role = :role', { role: 'admin' })
                .execute();
        });
    }

    async chargeToken(toAccountId: number, amount: number) {
        return await this.connection1.transaction(async (manager) => {
            await manager.query(`
                UPDATE account set token_amount = account.token_amount + ${amount} where user_id = ${toAccountId}
            `);
        });
    }

    async reduceToken(fromAccountId: number, amount: number) {
        return await this.connection1.transaction(async (manager) => {
            await manager.query(`
                UPDATE account set token_amount = account.token_amount - ${amount} where user_id = ${fromAccountId}
            `);
        });
    }
}
