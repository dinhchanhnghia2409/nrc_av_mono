import { Controller, Get, HttpStatus, Param, ParseIntPipe, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserGuard } from '../core';
import { InterfaceService } from './interface.service';

@ApiTags('interface')
@Controller('interface')
@UseGuards(UserGuard)
export class InterfaceController {
  constructor(private readonly interfaceService: InterfaceService) {}

  @Get('/:id/cmds')
  async getInterfaceCmds(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    const interfaceCmds = await this.interfaceService.getInterfaceCmds(id);
    return res.status(HttpStatus.OK).send(interfaceCmds);
  }
}
