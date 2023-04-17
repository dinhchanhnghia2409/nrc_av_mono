import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UserGuard } from '../core';
import { TimeoutInterceptor } from '../core/interceptors';
import { InterfaceService } from './interface.service';

@ApiTags('interface')
@Controller('interface')
@ApiCookieAuth()
@UseGuards(UserGuard)
@UseInterceptors(TimeoutInterceptor)
export class InterfaceController {
  constructor(private readonly interfaceService: InterfaceService) {}

  @Get('/:id')
  async getInterface(@Res() res: Response, @Param('id', ParseIntPipe) id: number) {
    return res
      .status(HttpStatus.OK)
      .send(await this.interfaceService.getInterfaceWithAllRelations(id));
  }
}
