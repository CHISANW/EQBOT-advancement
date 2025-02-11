import { Account } from '../entites/account.entity';

export class AccountGroupDto {
    id: string;
    count: number;
    type: string;
    accounts: Account[];

    constructor(id: string, count: number, type: string, accounts: Account[]) {
        this.id = id;
        this.count = count;
        this.type = type;
        this.accounts = accounts;
    }
}
