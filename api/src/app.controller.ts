import type { Greeting } from "@cyber/contracts";
import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getGreeting(): Greeting {
    return {
      message: "Hello from Cyber Guard API",
      timestamp: new Date().toISOString(),
    };
  }
}
