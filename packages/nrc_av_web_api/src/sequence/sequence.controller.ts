import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DatabaseService, Sequence } from '../core';
import { Response } from 'express';

@ApiTags('Sequence')
@Controller('sequence')
export class SequenceController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('')
  async getActiveListCar(@Res() res: Response) {
    const sequence = await this.databaseService.getMany(Sequence);
    return res.status(HttpStatus.OK).send(sequence);
  }
}
