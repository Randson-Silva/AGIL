// src/auth/google.strategy.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { name, emails, photos, displayName } = profile;

    // Extrai o primeiro e último nome com fallback caso não venham preenchidos
    const firstName = name?.givenName || displayName?.split(' ')[0] || '';
    const lastName =
      name?.familyName || displayName?.split(' ').slice(1).join(' ') || '';

    const user = {
      email: emails?.[0]?.value,
      firstName,
      lastName,
      picture: photos?.[0]?.value,
    };

    return user;
  }
}
