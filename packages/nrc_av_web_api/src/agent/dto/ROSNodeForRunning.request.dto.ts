import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';

export class ROSNodesForRunningDTO {
  @ApiProperty({
    description: 'List ids of nodes to run',
    example: [1, 2, 3],
    isArray: true,
    type: Number
  })
  nodeIds: number[];
}

export const vROSNodesForRunningDTO = joi.object<ROSNodesForRunningDTO>({
  nodeIds: joi.array().items(joi.number().required()).required()
});
