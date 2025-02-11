export interface eb3ServiceV1 {
    transaction(fromAddress, privateKey, toAddresss): Promise<any>;

    createAccounts(): Promise<void>;

    deleteAccount(): Promise<void>;
}
