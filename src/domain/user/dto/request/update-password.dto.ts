import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdatePasswordDto {
  @ApiProperty({ example: "newpassword", description: "새 비밀번호" })
  @IsNotEmpty()
  newPassword: string;
}
