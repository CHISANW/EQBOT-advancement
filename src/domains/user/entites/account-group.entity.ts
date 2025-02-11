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

    @Column({ type: 'enum', enum: Type })
    type: Type;

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
}
