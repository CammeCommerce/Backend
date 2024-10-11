import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateWithdrawalMatchingDto {
  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  @IsString()
  mediumName: string;

  @ApiProperty({ example: "계좌 별칭", description: "계좌 별칭" })
  @IsString()
  accountAlias: string;

  @ApiProperty({ example: "용도", description: "용도" })
  @IsString()
  purpose: string;
}
