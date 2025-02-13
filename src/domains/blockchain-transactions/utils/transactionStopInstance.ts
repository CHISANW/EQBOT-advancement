export class TransactionStopInstance {
    static isStop: Map<number, IsStopInstance> = new Map<number, IsStopInstance>();

    static set(groupId: number, isStop: boolean, assetType: AssetType) {
        let isStopInstance = this.isStop.get(groupId);
        if (!isStopInstance) {
            isStopInstance = new IsStopInstance(isStop, assetType);
        } else {
            isStopInstance.updateCoinAndToken(assetType, isStop);
        }

        this.isStop.set(groupId, isStopInstance);
        return isStopInstance;
    }

    static get(groupId: number) {
        return this.isStop.get(groupId);
    }

    static isTransactionStopped(groupId: number) {
        return this.isStop.get(groupId);
    }

    static isTransactionSuccess(groupId: number) {
        return !this.isStop.get(groupId);
    }

    static keys() {
        return Array.from(this.isStop.keys());
    }
}

export class IsStopInstance {
    isToken: boolean;
    isCoin: boolean;
    isStop: boolean;

    constructor(isStop: boolean, assetType: AssetType) {
        this.isToken = assetType === AssetType.TOKEN;
        this.isCoin = assetType === AssetType.COIN;
        this.isStop = isStop;
    }

    updateCoinAndToken(assetType: AssetType, isStop: boolean) {
        if (assetType === AssetType.TOKEN) {
            this.isToken = true; // 기존 값 유지하면서 TOKEN을 true로 설정
        }
        if (assetType === AssetType.COIN) {
            this.isCoin = true; // 기존 값 유지하면서 COIN을 true로 설정
        }
        this.isStop = isStop; // isStop 값 업데이트
    }

    isSafe() {
        return this.isToken && this.isToken;
    }
}
export enum AssetType {
    COIN = 'COIN',
    TOKEN = 'TOKEN',
}
