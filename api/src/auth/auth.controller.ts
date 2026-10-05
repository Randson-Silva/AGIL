import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthLoginDto } from './dtos/auth.login.dto.js';
import { AuthRegisterDto } from './dtos/auth.register.dto.js';
import { ForgotPasswordDto } from './dtos/forgot-password.dto.js';
import { ResetPasswordDto } from './dtos/reset-password.dto.js';
import { VerifyCodeDto } from './dtos/verify-code.dto.js';
import { GoogleOauthGuard } from './oauth/google-oauth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: AuthLoginDto) {
    const { email, password, profile } = loginDto;

    const response = await this.authService.login({
      email,
      password,
      profile,
    });

    return response;
  }

  @Post('register')
  async register(@Body() registerDto: AuthRegisterDto) {
    const { email, name, password, profile } = registerDto;

    const response = await this.authService.register({
      email,
      name,
      password,
      profile,
    });

    return response;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('verify-code')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('google')
  @UseGuards(GoogleOauthGuard)
  // o Guard cuida do redirecionamento
  async googleAuth() {}

  // callback chamado pelo Google
  @Get('google/redirect')
  @UseGuards(GoogleOauthGuard)
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const authData = await this.authService.validateGoogleUser(req.user);

    // redireciona pro front enviando o token JWT gerado
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:8081',
    );
    return res.redirect(
      `${frontendUrl}/oauth-success?token=${authData.access_token}`,
    );
  }
}
