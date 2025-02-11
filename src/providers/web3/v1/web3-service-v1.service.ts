import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';
import { Account } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { UserService } from '../../../domains/user/user.service';

@Injectable()
export class Web3ServiceV1 implements Web3ServiceV1 {
    constructor(
        @Inject('WEB3') private readonly web3: any,
        private readonly userService: UserService,
    ) {}

    public async createAccounts() {
        let accounts = Array.from({ length: 10 }, () => this.web3.eth.getAccounts().create());
        return await this.userService.save(accounts);
    }

    public deleteAccount(): Promise<void> {
        return;
    }
    public async transaction(fromAddress, privateKey, toAddresss): Promise<any> {
        const tx = await this.createTransaction(fromAddress, toAddresss);

        const signedTxPromise = this.signTransaction(tx, privateKey);
        const signedTx = await signedTxPromise;

        return (await this.sendTransaction(signedTx)).transactionHash;
    }

    private async createTransaction(senderAddress: string, receiverAddress: string) {
        const nonce = await this.web3.eth.getTransactionCount(senderAddress, 'latest');
        return {
            from: senderAddress,
            to: receiverAddress,
            value: this.web3.utils.toWei('0', 'ether'), // 0이더 전송
            gas: 21000,
            gasPrice: this.web3.utils.toWei('10', 'gwei'),
            nonce: nonce,
        };
    }

    private async signTransaction(txObject: any, privateKey: string): Promise<any> {
        return await this.web3.eth.accounts.signTransaction(txObject, privateKey);
    }

    private async sendTransaction(signedTx: any): Promise<any> {
        if (!signedTx.rawTransaction) {
            throw new Error('No rawTransaction found in signedTx.');
        }
        return this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
}
