export interface CoinService {
    sendCoin(user: any, uuid: any, retryCount?: number): Promise<number>;

    sendCoin1(groupId: number, isStop?: boolean): Promise<void>;
}
