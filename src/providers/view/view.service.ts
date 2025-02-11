import { format } from 'date-fns';

export interface ViewService {
  printTransactionSummary(iteration: number): number;
  printCoinTransactionLog(transaction: string): void;
  rechargeToken(txHash: string): void;
  logTransactionHash(txHash: string): void;
  logPollingHash(txHash: string): void;
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class ViewServiceImpl implements ViewService {
  printTransactionSummary(iteration: number): number {
    const iterationCount =
      iteration === 0 ? Math.floor(Math.random() * 10) + 1 : iteration;
    const count = iterationCount * 10 + iterationCount * 9;
    const formattedTime = format(new Date(), 'yyyy-MM-dd HH:mm');
    console.log(`최초 실행 일 : ${formattedTime} ,총 실행 횟수 ${count}`);
    return iterationCount;
  }

  printCoinTransactionLog(transaction: string): void {
    console.log(`🔥 [코인 전송] 트랜잭션 해시: ${transaction}`);
  }

  rechargeToken(txHash: string) {
    if (txHash) {
      console.log(`🔥 [토큰 충전] ✅ 성공 | 트랜잭션 해시: ${txHash}`);
    }
  }

  logTransactionHash(txHash: string): void {
    console.log(`🔥 [토큰 전송] 트랜잭션 해시: ${txHash}`);
  }

  logPollingHash(txHash: string): void {
    console.log(`🔥 [코인 폴링] 트랜잭션 해시 : ${txHash}`);
  }
}
