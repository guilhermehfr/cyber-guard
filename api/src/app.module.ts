import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { configuration } from "./config/config.js";
import { envValidationSchema } from "./config/env.validation.js";

const envFilePath = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.local";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [envFilePath, ".env"],
      load: [configuration],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: false,
        allowUnknown: true,
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
