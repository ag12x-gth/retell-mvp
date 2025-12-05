import { Module } from '@nestjs/common';
import { RetellController } from './retell.controller';
import { RetellService } from './retell.service';

@Module({
  controllers: [RetellController],
  providers: [RetellService],
  exports: [RetellService],
})
export class RetellModule {}
