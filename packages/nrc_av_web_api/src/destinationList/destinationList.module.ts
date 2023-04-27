import { Module } from '@nestjs/common';
import { DestinationListService } from './destinationList.service';

@Module({
  providers: [DestinationListService],
  exports: [DestinationListService]
})
export class DestinationListModule {}
