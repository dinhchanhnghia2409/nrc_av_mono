import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserGuard } from 'src/core';
import { Request, Response } from 'express';

@ApiTags('user')
@Controller('user')
export class UserController {
  @Get('/me')
  @UseGuards(UserGuard)
  async getMe(@Res() res: Response, @Req() req: Request) {
    return res.status(HttpStatus.OK).send(req.user);
  }
}
