import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class DepositDetailDto {
  @ApiProperty({ example: 1, description: "입금 ID" })
  id: number;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  mediumName: string;

  @ApiProperty({ example: "2024-10-10", description: "입금일자" })
  depositDate: string;

  @ApiProperty({ example: "우리동네", description: "계좌 별칭" })
  accountAlias: string;

  @ApiProperty({ example: 20000, description: "입금액" })
  depositAmount: number;

  @ApiProperty({ example: "계좌 적요", description: "계좌 적요" })
  accountDescription: string;

  @ApiProperty({ example: "거래수단1", description: "거래수단1" })
  transactionMethod1: string;

  @ApiProperty({ example: "거래수단2", description: "거래수단2" })
  transactionMethod2: string;

  @ApiProperty({ example: "계좌 메모", description: "계좌 메모" })
  accountMemo: string;

  @ApiProperty({
    example: "상대 계좌 예금주명",
    description: "상대 계좌 예금주명",
  })
  counterpartyName: string;

  @ApiProperty({ example: "용도", description: "용도" })
  purpose: string;

  @ApiProperty({ example: "거래처", description: "거래처" })
  clientName: string;

  @ApiProperty({ example: false, description: "매체명 매칭 여부" })
  isMediumMatched: boolean;
}

export class GetDepositsDto {
  @ApiProperty({ type: [DepositDetailDto], description: "입금 목록" })
  @Type(() => DepositDetailDto)
  items: DepositDetailDto[];
}
