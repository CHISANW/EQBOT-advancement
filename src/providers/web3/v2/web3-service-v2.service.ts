import { Inject, Injectable } from '@nestjs/common';
import { Web3Service } from './web3Service';
import { Config } from '../../../config/environment/config';
import { Account } from '../../../domains/user/entites/account.entity';

@Injectable()
export class Web3ServiceV2Impl implements Web3Service {
    constructor(@Inject('WEB3') private readonly web3: any) {}

    async transferTokenToAdminOrAccount(account: Account, toAddress?: string) {
        const senderAddress = account.address; // 보내는 지갑 주소
        const recipientAddress = toAddress ?? Config.getEnvironment().EQ_RECIPIENT_ADDRESS; // 받는 사람 주소
        const privateKey = account.private_key; // 보내는 사람의 개인 키

        const contractAddress = Config.getEnvironment().EQ_CONTRACT_ADDRESS;

        const contractABI = [
            {
                constant: false,
                inputs: [
                    { name: '_to', type: 'address' },
                    { name: '_value', type: 'uint256' },
                ],
                name: 'transfer',
                outputs: [{ name: '', type: 'bool' }],
                type: 'function',
            },
        ];

        const contract = await new this.web3.eth.Contract(contractABI, contractAddress);
        const tokenAmount = this.web3.utils.toBN(account.token_amount);

        return await this.sendToken(
            contract,
            senderAddress,
            recipientAddress,
            tokenAmount,
            privateKey,
        );
    }

    private async sendToken(
        contract,
        senderAddress,
        recipientAddress,
        tokenAmount,
        privateKey,
        retry: number = 3,
    ) {
        try {
            // 1. transfer 함수 호출을 위한 트랜잭션 데이터 생성
            let nonce = await this.web3.eth.getTransactionCount(senderAddress, 'latest');
            if (retry < 3) {
                nonce = await this.web3.eth.getTransactionCount(senderAddress, 'pending');
            }
            const txData = contract.methods.transfer(recipientAddress, tokenAmount).encodeABI();
            const tx = {
                from: senderAddress,
                to: contract.options.address,
                gasLimit: 100000,
                gasPrice: this.web3.utils.toWei('10', 'gwei'), // 현재 네트워크 가스 가격
                nonce: nonce,
                data: txData,
            };

            const signedTx = await this.web3.eth.accounts.signTransaction(tx, privateKey);

            const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            return receipt.transactionHash;
        } catch (error) {
            if (error && retry > 0) {
                await new Promise((resolve) => setTimeout(resolve, 4000));
                return this.sendToken(
                    contract,
                    senderAddress,
                    recipientAddress,
                    tokenAmount,
                    privateKey,
                    retry - 1,
                );
            }
        }
    }

    public async createAccounts(accountCount?: number) {
        return Array.from({ length: accountCount ?? 10 }, () => this.web3.eth.accounts.create());
    }

    public async deleteAccount() {
        // await this.userService.deleteTenAccounts();
    }

    public async transaction(fromAddress, privateKey, toAddresss, amount): Promise<any> {
        const tx = await this.createTransaction(fromAddress, toAddresss);
        const signedTx = await this.signTransaction(tx, privateKey);
        const newVar = await this.sendTransaction(signedTx);
        return newVar.transactionHash;
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
        return await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
}
