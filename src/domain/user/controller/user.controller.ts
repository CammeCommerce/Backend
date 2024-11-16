import { Body, Controller, Patch, Post, Get, Session } from "@nestjs/common";
import { ApiOperation, ApiBody } from "@nestjs/swagger";
import { UserService } from "../service/user.service";
import { UserLoginDto } from "../dto/request/user-login.dto";
import { UserLoginResultDto } from "../dto/response/user-login-result.dto";
import { UpdatePasswordDto } from "../dto/request/update-password.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: "유저 로그인",
    operationId: "loginUser",
    tags: ["user"],
  })
  @ApiBody({
    description: "로그인을 위한 유저 정보",
    type: UserLoginDto,
  })
  @Post("login")
  async loginUser(
    @Body() dto: UserLoginDto,
    @Session() session: Record<string, any>
  ): Promise<UserLoginResultDto> {
    return await this.userService.loginUser(dto, session);
  }

  @ApiOperation({
    summary: "로그인 상태 확인",
    operationId: "getLoginStatus",
    tags: ["user"],
  })
  @Get("status")
  async getLoginStatus(
    @Session() session: Record<string, any>
  ): Promise<{ isLoggedIn: boolean }> {
    const isLoggedIn = await this.userService.getLoginStatus(session);
    return { isLoggedIn };
  }

  @ApiOperation({
    summary: "유저 로그아웃",
    operationId: "logoutUser",
    tags: ["user"],
  })
  @Post("logout")
  async logoutUser(
    @Session() session: Record<string, any>
  ): Promise<{ message: string }> {
    this.userService.logoutUser(session);
    return { message: "로그아웃에 성공했습니다." };
  }

  @ApiOperation({
    summary: "이메일 인증 요청",
    operationId: "sendEmailVerification",
    tags: ["user"],
  })
  @ApiBody({
    description: "인증 요청을 위한 이메일 주소",
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
    summary: "이메일 인증 확인",
    operationId: "verifyEmail",
    tags: ["user"],
  })
  @ApiBody({
    description: "이메일과 인증 코드를 입력하여 인증 확인",
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
    summary: "비밀번호 재설정",
    operationId: "updatePassword",
    tags: ["user"],
  })
  @ApiBody({
    description: "비밀번호를 재설정하기 위한 정보",
    schema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          example: "user@example.com",
          description: "비밀번호를 재설정할 이메일 주소",
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
