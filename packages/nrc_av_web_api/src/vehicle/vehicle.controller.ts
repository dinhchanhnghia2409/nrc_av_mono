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
  UseInterceptors,
  Sse
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Subject, map } from 'rxjs';
import { InterfaceInformationDTO } from '../agent/dto/interfaceInformation.res.dto';
import { UserGuard, HttpBodyValidatorPipe, EventEmitterNameSpace } from '../core';
import { TimeoutInterceptor } from '../core/interceptors';
import {
  ROSNodesCreationDTO,
  vROSNodesCreationDTO
} from '../rosNode/dto/rosNodesCreation.request.dto';
import { ROSNodeService } from '../rosNode/rosNode.service';
import {
  InterfaceFilesForRunningDTO,
  vInterfaceFilesForRunningDTO
} from './dto/interfaceFilesForRunning.request.dto';
import {
  InterfaceFilesForStoppingDTO,
  vInterfaceFilesForStoppingDTO
} from './dto/interfaceFilesForStopping.request.dto';
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
    private readonly rosNodeService: ROSNodeService,
    private readonly eventEmitter: EventEmitter2
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

  @Get(':id/ros-nodes')
  async getVehicleNodes(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.rosNodeService.getVehicleROSNodes(id));
  }

  @Get('/:id/ros-nodes/sync')
  async syncVehicleNodes(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.rosNodeService.syncVehicleNodes(id));
  }

  @Get('/:id/ros-nodes/status')
  async getVehicleROSNodesStatus(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.send(await this.rosNodeService.getROSNodeStatus(id));
  }

  @Get('/:id/interface-files/status')
  async getVehicleInterfaceFilesStatus(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ) {
    return res.send(await this.vehicleService.getInterfaceFilesStatus(id));
  }

  @Put('/:id/activation')
  async activateVehicle(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    return res.status(HttpStatus.OK).send(await this.vehicleService.activateVehicle(id));
  }

  @Post('/:id/ros-nodes')
  @UsePipes(new HttpBodyValidatorPipe(vROSNodesCreationDTO))
  async updateVehicleNodes(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() body: ROSNodesCreationDTO
  ) {
    return res.status(HttpStatus.OK).send(await this.rosNodeService.updateVehicleNodes(id, body));
  }

  @Post('/:id/execution/ros-core')
  async runROSmaster(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const result = await this.vehicleService.sendROSMasterCommand(id);
    return res.status(HttpStatus.OK).send(result);
  }

  @Post('/:id/execution/ros-nodes')
  @UsePipes(new HttpBodyValidatorPipe(vROSNodesForRunningDTO))
  async runROSnode(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() body: ROSNodesForRunningDTO
  ) {
    const result = await this.vehicleService.sendROSNodesForRunning(id, body);
    return res.status(HttpStatus.OK).send(result);
  }

  @Post('/:id/execution/interface-files')
  @UsePipes(new HttpBodyValidatorPipe(vInterfaceFilesForRunningDTO))
  async startInterfaceFiles(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() body: InterfaceFilesForRunningDTO
  ) {
    return res.status(HttpStatus.OK).send(await this.vehicleService.startInterfaceFiles(id, body));
  }

  @Post('/:id/termination/interface-files')
  @UsePipes(new HttpBodyValidatorPipe(vInterfaceFilesForStoppingDTO))
  async stopInterfaceFiles(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Body() body: InterfaceFilesForStoppingDTO
  ) {
    return res.status(HttpStatus.OK).send(await this.vehicleService.stopInterfaceFiles(id, body));
  }

  @Sse('/:id/interface/:interface/details-status')
  sseInterfaceDetailsStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('interface', ParseIntPipe) paramInterfaceId: number
  ) {
    const subject = new Subject();
    this.eventEmitter.on(
      EventEmitterNameSpace.VEHICLE_INTERFACE_DETAIL_STATUS,
      (data: InterfaceInformationDTO) => {
        const { algorithms, interfaceId, machines, sensors, vehicleId } = data;
        if (id !== vehicleId || paramInterfaceId !== interfaceId) {
          return;
        }
        subject.next({ machines, algorithms, sensors });
      }
    );
    return subject.pipe(map((data) => ({ data })));
  }
}
