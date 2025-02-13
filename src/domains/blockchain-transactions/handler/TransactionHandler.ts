export interface TransactionHandler {
    handleTransaction(data: any): Promise<void>;
}
