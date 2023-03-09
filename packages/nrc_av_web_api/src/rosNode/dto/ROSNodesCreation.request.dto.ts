import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';
import { nodeValidateSchema } from '../../core';

export class ROSNodesCreationDTO {
  @ApiProperty({
    description: 'ros nodes',
    example: [{ name: 'sim 3', packageName: 'nrc_av_ui' }],
    isArray: true
  })
  rosNodes: { name: string; packageName: string }[];
}

const rosNodeSchema = joi.object({
  name: nodeValidateSchema.name.required(),
  packageName: nodeValidateSchema.packageName.required()
});

export const vROSNodesCreationDTO = joi.object<ROSNodesCreationDTO>({
  rosNodes: joi.array().items(rosNodeSchema).required()
});
