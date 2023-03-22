import {
  Controller,
  Get,
  Res,
  HttpStatus,
  Put,
  Param,
  ParseIntPipe,
  UseGuards,
  Post,
  UsePipes,
  Body,
  UseInterceptors
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserGuard, HttpJoiValidatorPipe } from '../core';
import { TimeoutInterceptor } from '../core/interceptors';
import {
  ROSNodesCreationDTO,
  vROSNodesCreationDTO
} from '../rosNode/dto/rosNodesCreation.request.dto';
import { ROSNodeService } from '../rosNode/rosNode.service';
import {
  LaunchFileForRunningDTO,
  vLaunchFileForRunningDTO
} from './dto/launchFileForRunning.request.dto';
import {
  LaunchFileForStoppingDTO,
  vLaunchFileForStoppingDTO
} from './dto/launchFileForStopping.request.dto';
import { ROSNodesForRunningDTO, vROSNodesForRunningDTO } from './dto/rosNodeForRunning.request.dto';
import { VehicleService } from './vehicle.service';

@ApiTags('vehicle')
@Controller('vehicle')
@ApiCookieAuth()
@UseGuards(UserGuard)
@UseInterceptors(TimeoutInterceptor)
export class VehicleController {
  constructor(
    private readonly vehicleService: VehicleService,
    private readonly rosNodeService: ROSNodeService
  ) {}

  @Get('/active')
  async listActiveVehicle(@Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.vehicleService.getActiveOnlineVehicles());
  }

  @Get('/waiting')
  async listWaitingVehicle(@Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.vehicleService.getWaitingOnlineVehicles());
  }

  @Get('/:id')
  async getVehicleById(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.vehicleService.getVehicle(id));
  }

  @Get(':id/ROS-nodes')
  async getVehicleNodes(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.rosNodeService.getVehicleROSNodes(id));
  }

  @Get('/:id/ROS-nodes/sync')
  async syncVehicleNodes(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.rosNodeService.syncVehicleNodes(id));
  }

  @Get('/:id/ROS-nodes/status')
  async getVehicleROSNodesStatus(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.send(await this.rosNodeService.getROSNodeStatus(id));
  }

  @Put('/:id/activation')
  async activateVehicle(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.vehicleService.activateVehicle(id));
  }

  @Get('/:id/launch-file/status')
  async getVehicleLaunchFileStatus(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.send(await this.vehicleService.getLaunchFileStatus(id));
  }

  @Post('/:id/ROS-nodes')
  @UsePipes(new HttpJoiValidatorPipe(vROSNodesCreationDTO))
  async updateVehicleNodes(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() body: ROSNodesCreationDTO
  ) {
    return res.status(HttpStatus.OK).send(await this.rosNodeService.updateVehicleNodes(id, body));
  }

  @Post('/:id/ROS-master-execution')
  async runROSmaster(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const result = await this.vehicleService.sendROSMasterCommand(id);
    return res.status(HttpStatus.OK).send(result);
  }

  @Post('/:vehicleId/ROS-node-execution')
  @UsePipes(new HttpJoiValidatorPipe(vROSNodesForRunningDTO))
  async runROSnode(
    @Param('vehicleId', ParseIntPipe) vehicleId: number,
    @Res() res: Response,
    @Body() body: ROSNodesForRunningDTO
  ) {
    const result = await this.vehicleService.sendROSNodesForRunning(vehicleId, body);
    return res.status(HttpStatus.OK).send(result);
  }

  @Post('/:id/launch-file')
  @UsePipes(new HttpJoiValidatorPipe(vLaunchFileForRunningDTO))
  async sendLaunchFileForRunning(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() body: LaunchFileForRunningDTO
  ) {
    return res
      .status(HttpStatus.OK)
      .send(await this.vehicleService.sendLaunchFileForRunning(id, body));
  }

  @Post('/:id/launch-file-termination')
  @UsePipes(new HttpJoiValidatorPipe(vLaunchFileForStoppingDTO))
  async stopLaunchFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() body: LaunchFileForStoppingDTO
  ) {
    return res
      .status(HttpStatus.OK)
      .send(await this.vehicleService.sendLaunchFileForStopping(id, body));
  }
}
