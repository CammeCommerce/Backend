import { Body, Controller, Patch, Post } from "@nestjs/common";
import { UserService } from "src/domain/user/service/user.service";
import { ApiBody, ApiOperation } from "@nestjs/swagger";
import { UserLoginDto } from "src/domain/user/dto/request/user-login.dto";
import { UserLoginResultDto } from "src/domain/user/dto/response/user-login-result.dto";
import { UpdatePasswordDto } from "src/domain/user/dto/request/update-password.dto";

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

  @ApiOperation({
    summary: "이메일 발송 API",
    operationId: "sendEmailVerification",
    tags: ["user"],
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          example: "user@example.com",
          description: "인증 요청을 보낼 이메일 주소",
        },
      },
    },
  })
  @Post("send")
  async sendEmailVerification(@Body("email") email: string): Promise<void> {
    return await this.userService.sendEmailVerification(email);
  }

  @ApiOperation({
    summary: "이메일 검증 API",
    operationId: "verifyEmail",
    tags: ["user"],
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          example: "user@example.com",
          description: "이메일 주소",
        },
        code: {
          type: "string",
          example: "abc123",
          description: "이메일로 전송된 인증 코드",
        },
      },
    },
  })
  @Post("verify")
  async verifyEmail(
    @Body("email") email: string,
    @Body("code") code: string
  ): Promise<void> {
    return await this.userService.verifyEmail(email, code);
  }

  @ApiOperation({
    summary: "비밀번호 재설정 API",
    operationId: "resetPassword",
    tags: ["user"],
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          example: "user@example.com",
          description: "이메일 주소",
        },
        newPassword: {
          type: "string",
          example: "newpassword123",
          description: "새로운 비밀번호",
        },
      },
    },
  })
  @Patch("reset-password")
  async updatePassword(
    @Body("email") email: string,
    @Body() dto: UpdatePasswordDto
  ): Promise<void> {
    return await this.userService.updatePassword(email, dto);
  }
}
