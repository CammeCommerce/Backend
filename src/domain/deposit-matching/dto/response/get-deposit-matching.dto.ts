import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class DepositMatchingDetailDto {
  @ApiProperty({ example: 1, description: "입금 매칭 ID" })
  id: number;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  mediumName: string;

  @ApiProperty({ example: "계좌 별칭", description: "계좌 별칭" })
  accountAlias: string;

  @ApiProperty({ example: "용도", description: "용도" })
  purpose: string;
}

export class GetDepositMatchingsDto {
  @ApiProperty({
    type: [DepositMatchingDetailDto],
    description: "입금 매칭 목록",
  })
  @Type(() => DepositMatchingDetailDto)
  items: DepositMatchingDetailDto[];
}
