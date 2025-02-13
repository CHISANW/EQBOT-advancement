import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { AccountGroup } from './account-group.entity';
export enum ROLE {
    ADMIN = 'admin',
    USER = 'user',
}
@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ type: 'enum', enum: ROLE, default: ROLE.USER })
    role: ROLE;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    private_key: string;

    @Column({ default: 0 })
    token_amount: number;

    @Column({ default: 0 })
    coin_amount: number;

    @Column({ type: 'float', nullable: true, default: () => '0' })
    amount: number;

    @CreateDateColumn({
        nullable: false,
        type: 'datetime',
        precision: 0,
        default: () => 'CURRENT_TIMESTAMP(0)',
    })
    created_at: Date;

    @ManyToOne(() => AccountGroup, (accountGroup) => accountGroup.accounts, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'accountGroupId' })
    accountGroup: AccountGroup;

    constructor(address: string, private_key: string) {
        this.address = address;
        this.private_key = private_key;
    }

    static of(address: string, private_key: string) {
        return new Account(address, private_key);
    }
}
