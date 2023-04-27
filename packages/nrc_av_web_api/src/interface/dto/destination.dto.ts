import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class DestinationDTO {
  @ApiProperty({
    description: 'posX',
    example: 12
  })
  posX: number;

  @ApiProperty({
    description: 'posY',
    example: 1
  })
  posY: number;

  @ApiProperty({
    description: 'posTh',
    example: 4
  })
  posTh: number;
}

export const vDestDTO = joi.object<DestinationDTO>({
  posX: joi.number().required(),
  posY: joi.number().required(),
  posTh: joi.number().required()
});
