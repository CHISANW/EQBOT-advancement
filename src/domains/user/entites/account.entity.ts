import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AccountGroup } from './account-group.entity';

@Entity()
export class Account {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    private_key: string;

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
    accountGroup: AccountGroup;

    constructor(address: string, private_key?: string) {
        this.address = address;
        if (private_key) {
            this.private_key = private_key;
        }
    }

    static of(address: string, private_key?: string) {
        return new Account(address, private_key);
    }
}
