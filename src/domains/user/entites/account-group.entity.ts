import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from './account.entity';
export enum Type {
    TOKEN,
    COIN,
}

@Entity()
export class AccountGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    count: number;

    @Column({ default: false })
    isDeleted: boolean;

    @OneToMany(() => Account, (account) => account.accountGroup, {
        createForeignKeyConstraints: false,
    })
    accounts: Account[];

    constructor(accounts: Account[], count?: number) {
        this.accounts = accounts;
        this.count = count;
    }

    static of(accounts: Account[], count?: number) {
        return new AccountGroup(accounts, count);
    }

    maxCoinAccount() {
        return this.accounts.reduce((prev, current) => {
            return prev.coin_amount > current.coin_amount ? prev : current;
        });
    }

    maxTokenAccount() {
        return this.accounts.reduce((prev, current) => {
            return prev.token_amount > current.token_amount ? prev : current;
        });
    }

    minCoinAccount() {
        return this.accounts.reduce((prev, current) => {
            return prev.coin_amount < current.coin_amount ? prev : current;
        });
    }

    minTokenAccount() {
        return this.accounts.reduce((prev, current) => {
            return prev.coin_amount < current.coin_amount ? prev : current;
        });
    }

    maxCoinUserId() {
        return this.maxCoinAccount().user_id;
    }

    maxTokenUserId() {
        return this.maxTokenAccount().user_id;
    }

    minCoinUserId() {
        return this.minCoinAccount().user_id;
    }

    minTokenUserId() {
        return this.minTokenAccount().user_id;
    }

    startCoinAccountId() {
        const maxUserId = this.maxCoinUserId();
        let minUserId = this.minCoinUserId();

        if (maxUserId === minUserId) {
            return minUserId - 1;
        }

        return this.calculateRandomId(maxUserId, minUserId);
    }

    startTokenAccountId() {
        const maxUserId = this.maxTokenUserId();
        let minUserId = this.minTokenUserId();

        if (maxUserId === minUserId) {
            return minUserId - 1;
        }

        return this.calculateRandomId(maxUserId, minUserId);
    }

    // tokenToAccountAddress() {
    //     const groupId = this.startCoinAccountId();
    //     const account = this.accounts.find((account) => account.accountGroup.id === groupId);
    //     return account.address;
    // }

    private calculateRandomId(maxUserId: number, minUserId: number) {
        return Math.floor(Math.random() * (maxUserId - minUserId)) + minUserId;
    }

    maxCoinAccountZero() {
        const max = Math.max(...this.accounts.map((account) => account.coin_amount));

        return max === 0;
    }

    maxTokenAccountZero() {
        const max = Math.max(...this.accounts.map((account) => account.token_amount));

        return max === 0;
    }

    coinFromAddress() {
        return this.maxCoinAccount().address;
    }

    coinPrivateKey() {
        return this.maxCoinAccount().private_key;
    }

    coinToAddress() {
        return this.minCoinAccount().address;
    }

    tokenToAddress() {
        return this.minTokenAccount().address;
    }
}
