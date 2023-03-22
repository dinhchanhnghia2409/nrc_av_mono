import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class LaunchFileFoRunningDTO {
  @ApiProperty({
    description: 'List name of interface to run',
    example: ['kelly_interface'],
    isArray: true,
    type: String
  })
  names: string[];
}

export const vLaunchFileFoRunningDTO = joi.object<LaunchFileFoRunningDTO>({
  names: joi.array().items(joi.string().required()).required()
});
