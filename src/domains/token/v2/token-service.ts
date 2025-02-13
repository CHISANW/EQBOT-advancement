export interface TokenService {
    fillAmount(): Promise<any>;

    sendToken(groupId: number, isStop?: boolean): Promise<any>;

    // getAllIdsFromStopTokenMap(): number[];
}
