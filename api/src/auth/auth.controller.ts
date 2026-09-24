import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthLoginDto } from './dtos/auth.login.dto.js';
import { AuthRegisterDto } from './dtos/auth.register.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: AuthLoginDto) {
    const { email, password } = loginDto;

    const response = await this.authService.login({
      email,
      password,
    });

    return { response };
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
}
