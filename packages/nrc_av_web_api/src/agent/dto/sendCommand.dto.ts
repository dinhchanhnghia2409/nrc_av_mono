import { ApiProperty } from '@nestjs/swagger';

export class SendCommandDTO {
  @ApiProperty({ description: 'Sequence Id', example: 1 })
  sequenceId: number;
}
