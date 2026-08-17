import type { ArgumentsHost } from "@nestjs/common";
import { Catch } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { AppConfig } from "@/config/config.js";

import { GoogleOAuthFailureException } from "./google-oauth-error.js";

interface RedirectReply {
  redirect(url: string): unknown;
}

@Catch(GoogleOAuthFailureException)
export class GoogleOAuthExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(_exception: GoogleOAuthFailureException, host: ArgumentsHost): void {
    const webUrl = this.configService.getOrThrow<AppConfig["app"]["webUrl"]>("app.webUrl");
    const response = host.switchToHttp().getResponse<RedirectReply>();
    response.redirect(`${webUrl[0]}/login?oauth=error`);
  }
}
