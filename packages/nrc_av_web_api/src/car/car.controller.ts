import {
  Controller,
  Get,
  Res,
  HttpStatus,
  Put,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Car, DatabaseService } from '../core';
import { CarService } from './car.service';

@ApiTags('Car')
@Controller('car')
export class CarController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly carService: CarService,
  ) {}

  @Get('/active')
  async getActiveListCar(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .send(await this.databaseService.getManyByField(Car, 'status', 'ACTIVE'));
  }

  @Get('/waiting')
  async getWaitingListCar(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .send(
        await this.databaseService.getManyByField(Car, 'status', 'WAITING'),
      );
  }

  @Get('/:id')
  async getCarById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    return res.status(HttpStatus.OK).send(await this.carService.getCarById(id));
  }

  @Put('/:id/status')
  async registrationCar(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    return res
      .status(HttpStatus.OK)
      .send(await this.carService.updateStatus(id));
  }
}
