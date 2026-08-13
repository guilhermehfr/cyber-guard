import { Controller, Get } from '@nestjs/common';
import type { Greeting } from '@cyber/contracts';

@Controller()
export class AppController {
  @Get()
  getGreeting(): Greeting {
    return {
      message: 'Hello from Cyber Guard API',
      timestamp: new Date().toISOString(),
    };
  }
}