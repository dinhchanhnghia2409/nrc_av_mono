import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class LaunchFileForStoppingDTO {
  @ApiProperty({
    description: 'List name of interface to stop',
    example: ['kelly_interface'],
    isArray: true,
    type: String
  })
  names: string[];
}

export const vLaunchFileForStoppingDTO = joi.object<LaunchFileForStoppingDTO>({
  names: joi.array().items(joi.string().required()).required()
});
