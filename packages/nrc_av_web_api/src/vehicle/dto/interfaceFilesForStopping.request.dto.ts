import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class InterfaceFilesForStoppingDTO {
  @ApiProperty({
    description: 'List name of interface to stop',
    example: ['kelly_interface'],
    isArray: true,
    type: String
  })
  interfaceNames: string[];
}

export const vInterfaceFilesForStoppingDTO = joi.object<InterfaceFilesForStoppingDTO>({
  interfaceNames: joi.array().items(joi.string().required()).required()
});
