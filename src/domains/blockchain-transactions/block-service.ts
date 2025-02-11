export interface BlockService {
    generateRandomTransactions(iteration: number, amount: string, email: string): Promise<void>;

    testMQ(group?: number, count?: number);
}
