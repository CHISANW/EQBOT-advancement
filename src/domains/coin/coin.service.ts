export interface CoinService {
    sendCoin(user: any, uuid: any, retryCount?: number): Promise<number>;
}
