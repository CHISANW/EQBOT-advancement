import { forwardRef, Module } from '@nestjs/common';
import Web3 from 'web3';
import axios from 'axios';
import { EqHubService } from './eqhub.service';
import { Web3ServiceV1 } from './v1/web3-service-v1.service';
import { UserModule } from '../../domains/user/user.module';
import { AxiosModule } from '../axios/axios.module';
import { ViewModule } from '../view/view.module';
import { Web3ServiceV2Impl } from './v2/web3-service-v2.service';

@Module({
    imports: [AxiosModule, ViewModule],
    providers: [
        Web3ServiceV1,
        EqHubService,
        { provide: 'Web3Service', useClass: Web3ServiceV2Impl },

        {
            provide: 'WEB3',
            useValue: new Web3(
                new Web3.providers.HttpProvider(
                    'https://socket-ag.eqhub.eqbr.com?socketKey=yFbbmbcmFrEIBKeVg9uT8B_nts5ARjQfzNK2iMLhWJE',
                ),
            ),
        },
        {
            provide: 'EQ_HUB_API',
            useFactory: () =>
                axios.create({
                    baseURL: 'https://ag.eqhub.eqbr.com/api/',
                }),
        },
    ],
    exports: ['EQ_HUB_API', 'Web3Service', Web3ServiceV1, EqHubService],
})
export class Web3Module {}
