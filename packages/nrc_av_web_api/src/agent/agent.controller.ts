import {
  Controller,
  Param,
  Post,
  Res,
  ParseIntPipe,
  UseGuards,
  UsePipes,
  Body
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HttpJoiValidatorPipe, UserGuard } from '../core';
import { AgentService } from './agent.service';
import { ROSNodesForRunningDTO, vROSNodesForRunningDTO } from './dto/ROSNodeForRunning.request.dto';

@ApiTags('agent')
@Controller('agent')
@ApiBearerAuth()
@UseGuards(UserGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post('/socket/:vehicleId/ROS-master')
  async runROSmaster(@Param('vehicleId', ParseIntPipe) vehicleId: number, @Res() res: Response) {
    const result = await this.agentService.sendROSMasterCommand(vehicleId);
    return res.send(result);
  }

  @Post('/socket/:vehicleId/ROS-node')
  @UsePipes(new HttpJoiValidatorPipe(vROSNodesForRunningDTO))
  async runROSnode(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Res() res: Response,
    @Body() body: ROSNodesForRunningDTO
  ) {
    const result = await this.agentService.sendROSNodesForRunning(vehicleId, body);
    return res.send(result);
  }
}
