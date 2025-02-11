import { Module } from '@nestjs/common';
import { ViewServiceImpl } from './view.service';

@Module({
  providers: [
    {
      provide: 'ViewService',
      useClass: ViewServiceImpl,
    },
  ],
  exports: ['ViewService']
})
export class ViewModule {}
