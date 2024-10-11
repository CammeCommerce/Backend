import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { NestExpressApplication } from "@nestjs/platform-express";
import * as moment from "moment-timezone";

async function bootstrap() {
  moment.tz.setDefault("Asia/Seoul");

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle("API Documentation")
    .setVersion("1.0")
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup("api", app, swaggerDocument);

  await app.listen(8080);
}
bootstrap();
