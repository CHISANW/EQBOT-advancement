import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entites/account.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class AccountRepository {
    constructor(
        @InjectRepository(Account, 'connection1')
        private readonly userRepository: Repository<Account>,
    ) {}

    async save(account: Account, transaction?: EntityManager): Promise<Account> {
        if (transaction) {
            return transaction.getRepository(Account).save(account);
        }
        return this.userRepository.save(account);
    }

    async findById(userId: number, transaction?: EntityManager): Promise<Account> {
        return transaction
            ? await transaction.getRepository(Account).findOneOrFail({ where: { user_id: userId } })
            : await this.userRepository.findOneOrFail({ where: { user_id: userId } });
    }

    async deleteTenAccounts() {
        await this.userRepository.query(`
                DELETE u FROM user u
                JOIN (
                    SELECT user_id FROM user 
                    ORDER BY user_id DESC
                    LIMIT 10
                ) AS subquery ON u.user_id = subquery.user_id;
            `);
    }

    async totalCount() {
        return await this.userRepository.count();
    }

    async maxAmountUser() {
        return await this.userRepository
            .createQueryBuilder('user')
            .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('MAX(user.amount)')
                    .from('user', 'user')
                    .getQuery();
                return 'user.amount = ' + subQuery;
            })
            .getOne();
    }

    async minAmountUser() {
        return await this.userRepository
            .createQueryBuilder('user')
            .where((qb) => {
                const subQuery = qb
                    .subQuery()
                    .select('MIN(user.amount)')
                    .from('user', 'user')
                    .getQuery();
                return 'user.amount = ' + subQuery;
            })
            .getOne();
    }

    async findUserNotMappingGroup(userCount?: number) {
        return await this.userRepository
            .createQueryBuilder('user')
            .where('accountGroupId IS NULL')
            .orderBy('user.created_at', 'ASC')
            .limit(userCount ?? 10)
            .getMany();
    }

    async softDeleteAccount(groupId: number) {
        return await this.userRepository
            .createQueryBuilder()
            .update(Account)
            .set({ accountGroup: null })
            .where('accountGroupId = :groupId', { groupId })
            .execute();
    }
}
