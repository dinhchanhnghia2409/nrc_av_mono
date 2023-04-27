import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class InterfaceDestDTO {
  @ApiProperty({
    description: 'name',
    example: 'Dest 0'
  })
  name: string;

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

export const vInterfaceDestDTO = joi.object<InterfaceDestDTO>({
  name: joi.string().required(),
  posX: joi.number().required(),
  posY: joi.number().required(),
  posTh: joi.number().required()
});
