import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { Logger } from './logger.service';

@Module({
    imports: [ClsModule],
    providers: [Logger],
    exports: [Logger],
})
export class LoggerModule {}
