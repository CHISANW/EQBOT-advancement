import { AccountGroup } from '../../../domains/user/entites/account-group.entity';
import { Account } from '../../../domains/user/entites/account.entity';

export interface Web3Service {
    transaction(fromAddress, privateKey, toAddresss, amount): Promise<any>;

    createAccounts(accountCount?: number): Promise<any>;

    deleteAccount(): Promise<void>;

    transferTokenToAdminOrAccount(account: Account, toAddress?: string);
}
