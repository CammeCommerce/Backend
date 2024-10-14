import { ApiProperty } from "@nestjs/swagger";

export class UserLoginResultDto {
  @ApiProperty({ example: 1, description: "유저 ID" })
  id: number;

  @ApiProperty({
    example: "로그인에 성공했습니다.",
    description: "로그인 성공 메시지",
  })
  message: string;
}
