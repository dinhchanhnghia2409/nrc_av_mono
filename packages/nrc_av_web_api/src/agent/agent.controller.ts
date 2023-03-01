import { AgentService } from './agent.service';
import {
  Controller,
  Param,
  Post,
  Res,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserGuard } from '../core';

@ApiTags('agent')
@Controller('agent')
@ApiBearerAuth()
@UseGuards(UserGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('/socket/:carId/ROS-master')
  async runROSmaster(
    @Param('carId', ParseIntPipe) carId: number,
    @Res() res: Response,
  ) {
    const result = await this.agentService.sendROSMasterCommand(carId);
    return res.send(result[0]);
  }

  @Post('/socket/:carId/ROS-node/:rosNodeId')
  async runROSnode(
    @Param('carId', ParseIntPipe) carId: number,
    @Param('rosNodeId', ParseIntPipe) rosNodeId: number,
    @Res() res: Response,
  ) {
    return res.send(
      await this.agentService.sendROSLaunchCommand(carId, rosNodeId),
    );
  }
}
