import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "src/domain/user/service/user.service";
import { ApiOperation } from "@nestjs/swagger";
import { UserLoginDto } from "src/domain/user/dto/request/user-login.dto";
import { UserLoginResultDto } from "src/domain/user/dto/response/user-login-result.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: "유저 로그인",
    operationId: "loginUser",
    tags: ["user"],
  })
  @Post("login")
  async loginUser(@Body() dto: UserLoginDto): Promise<UserLoginResultDto> {
    return await this.userService.loginUser(dto);
  }
}
