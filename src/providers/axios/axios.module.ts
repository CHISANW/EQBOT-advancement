import { Module } from '@nestjs/common';
import { AxiosProvider } from './axios-provider.service';

@Module({
  providers: [AxiosProvider],
  exports: [AxiosProvider],
})
export class AxiosModule {}
