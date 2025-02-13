import { AccountGroup } from '../../../domains/user/entites/account-group.entity';

export interface Web3Service {
    transaction(fromAddress, privateKey, toAddresss, amount): Promise<any>;

    createAccounts(accountCount?: number): Promise<any>;

    deleteAccount(): Promise<void>;
}
