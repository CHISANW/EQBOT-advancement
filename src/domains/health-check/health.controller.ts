import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { ApiExcludeController } from '@nestjs/swagger';
import { CatchErrors } from 'src/core/decorators/catch-errors.decorator';

@Controller('health')
@ApiExcludeController(true)
export class HealthController {
    constructor (private readonly healthService: HealthService) {}

  @Get()
  @HealthCheck()
  @CatchErrors()
    async checkServerHealth (): Promise<string> {
        return 'success';
    }

  @Get('/all-systems')
  @HealthCheck()
  @CatchErrors()
  async checkAllSystemsHealth (): Promise<HealthCheckResult> {
      return this.healthService.checkAllSystemsHealth();
  }

  @Get('/external-systems')
  @HealthCheck()
  @CatchErrors()
  async checkExternalSystemsHealth (): Promise<HealthCheckResult> {
      return this.healthService.checkExternalSystemsHealth();
  }
}
