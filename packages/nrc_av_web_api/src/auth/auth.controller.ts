import {
  Body,
  Controller,
  HttpException,
  Post,
  Res,
  UsePipes,
  HttpStatus,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidatorPipe, DatabaseService, User, constant } from '../core';
import { LoginDTO, vLoginDTO } from './dto/loginDTO';
import { Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  @Post('/login')
  @ApiOperation({ summary: 'Login' })
  @ApiCreatedResponse({ type: String, description: 'access token' })
  @UsePipes(new JoiValidatorPipe(vLoginDTO))
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    const accessToken = await this.authService.login(body);

    return res
      .cookie(constant.authController.tokenName, accessToken, {
        maxAge: constant.authController.loginCookieTime,
      })
      .send(accessToken);
  }
}
