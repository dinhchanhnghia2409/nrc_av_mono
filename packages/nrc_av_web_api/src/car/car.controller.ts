import {
  Controller,
  Get,
  Res,
  HttpStatus,
  Put,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DataSource } from 'typeorm';
import { Car, CarStatus, DatabaseService, UserGuard } from '../core';
import { CarService } from './car.service';

@ApiTags('Car')
@Controller('car')
@ApiCookieAuth()
@UseGuards(UserGuard)
export class CarController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly carService: CarService,
  ) {}

  @Get('/active')
  async getActiveListCar(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .send(await this.carService.getCarsByField('status', CarStatus.ACTIVE));
  }

  @Get('/waiting')
  async getWaitingListCar(@Res() res: Response) {
    return res
      .status(HttpStatus.OK)
      .send(
        await this.databaseService.getManyByField(
          Car,
          'status',
          CarStatus.WAITING,
        ),
      );
  }

  @Get('/:id')
  async getCarById(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    return res
      .status(HttpStatus.OK)
      .send(await this.carService.getCarByField('id', id));
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
