import { Module } from '@nestjs/common';
import { WorksController } from './works.controller';
import { WorkService } from './works.service';

@Module({
  controllers: [WorksController],
  providers: [WorkService]
})
export class WorksModule {}
