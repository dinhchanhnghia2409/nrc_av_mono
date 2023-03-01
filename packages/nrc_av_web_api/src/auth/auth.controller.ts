import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JoiValidatorPipe, constant } from '../core';
import { LoginDTO, vLoginDTO } from './dto/loginDTO';
import { Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @ApiOperation({ summary: 'Login' })
  @ApiCreatedResponse({ type: String, description: 'access token' })
  @UsePipes(new JoiValidatorPipe(vLoginDTO))
  async login(@Body() body: LoginDTO, @Res() res: Response) {
    const accessToken = await this.authService.login(body);

    return res
      .cookie(constant.authController.tokenName, accessToken, {
        maxAge: constant.authController.loginCookieTime,
        httpOnly: true,
      })
      .send(accessToken);
  }
}
