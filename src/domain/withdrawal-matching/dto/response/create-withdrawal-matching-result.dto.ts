import { ApiProperty } from "@nestjs/swagger";

export class CreateWithdrawalMatchingResultDto {
  @ApiProperty({ example: 1, description: "출금 매칭 ID" })
  id: number;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  mediumName: string;

  @ApiProperty({ example: "계좌 별칭", description: "계좌 별칭" })
  accountAlias: string;

  @ApiProperty({ example: "용도", description: "용도" })
  purpose: string;
}
