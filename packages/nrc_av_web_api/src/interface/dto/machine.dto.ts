import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class MachineDTO {
  @ApiProperty({
    description: 'name',
    example: 'GPSBASE'
  })
  name: string;

  @ApiProperty({
    description: 'addr',
    example: 'ddl-ntrip.stanford.edu'
  })
  addr: string;
}

export const vMachineDTO = joi.object<MachineDTO>({
  name: joi.string().required(),
  addr: joi.string().required()
});
