import { Module } from '@nestjs/common';
import { DestinationModule } from '../destination/destination.module';
import { DestinationListModule } from '../destinationList/destinationList.module';
import { MultiDestinationService } from './multiDestination.service';

@Module({
  imports: [DestinationModule, DestinationListModule],
  providers: [MultiDestinationService],
  exports: [MultiDestinationService]
})
export class MultiDestinationModule {}
