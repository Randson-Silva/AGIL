import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    return {
      state: request.query.state,
    };
  }
}
