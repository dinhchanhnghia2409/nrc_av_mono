import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class InterfaceFilesForRunningDTO {
  @ApiProperty({
    description: 'List name of interface to run',
    example: ['kelly_interface'],
    isArray: true,
    type: String
  })
  interfaceNames: string[];
}

export const vInterfaceFilesForRunningDTO = joi.object<InterfaceFilesForRunningDTO>({
  interfaceNames: joi.array().items(joi.string().required()).required()
});
