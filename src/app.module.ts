import { Module } from "@nestjs/common";
import { AppController } from "src/app.controller";
import { AppService } from "src/app.service";
import { UserModule } from "src/domain/user/user.module";
import { MediumModule } from "src/domain/medium/medium.module";

@Module({
  imports: [UserModule, MediumModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
