import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import { GoogleOAuthFailureException } from "../google-oauth-error.js";

@Injectable()
export class GoogleAuthGuard extends AuthGuard("google") {
  handleRequest<TUser = unknown>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      throw new GoogleOAuthFailureException();
    }
    return user;
  }
}
