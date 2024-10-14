import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class UserLoginDto {
  @ApiProperty({ example: "user@gmail.com", description: "이메일" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "user1234", description: "비밀번호" })
  @IsNotEmpty()
  password: string;
}
