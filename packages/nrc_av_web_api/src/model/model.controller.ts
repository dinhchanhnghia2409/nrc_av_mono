import { Controller, Get, Res, Param, ParseIntPipe, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserGuard } from '../core';
import { ModelService } from './model.service';

@ApiTags('model')
@Controller('model')
@UseGuards(UserGuard)
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get('/:id/interfaces')
  async getModelInterface(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const modelInterface = await this.modelService.getModelInterface(id);
    return res.status(HttpStatus.OK).send(modelInterface);
  }
}
