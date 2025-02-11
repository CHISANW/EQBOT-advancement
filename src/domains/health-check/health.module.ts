import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { LoggerModule } from 'src/config/logger/logger.module';

@Module({
    imports: [TerminusModule, LoggerModule],
    controllers: [HealthController],
    providers: [HealthService],
})
export class HealthModule {}
