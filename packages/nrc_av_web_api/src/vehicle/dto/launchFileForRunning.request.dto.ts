import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class LaunchFileForRunningDTO {
  @ApiProperty({
    description: 'List name of interface to run',
    example: ['kelly_interface'],
    isArray: true,
    type: String
  })
  names: string[];
}

export const vLaunchFileForRunningDTO = joi.object<LaunchFileForRunningDTO>({
  names: joi.array().items(joi.string().required()).required()
});
