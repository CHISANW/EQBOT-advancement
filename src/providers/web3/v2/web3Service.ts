export interface Web3Service {
    transaction(fromAddress, privateKey, toAddresss, amount): Promise<any>;

    createAccounts(): Promise<any>;

    deleteAccount(): Promise<void>;
}
