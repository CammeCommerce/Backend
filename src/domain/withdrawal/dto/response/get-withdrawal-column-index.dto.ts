import { ApiProperty } from "@nestjs/swagger";

export class GetWithdrawalColumnIndexDto {
  @ApiProperty({ example: "A", description: "입금일자 엑셀 열" })
  withdrawalDateIdx: string;

  @ApiProperty({ example: "B", description: "계좌 별칭 엑셀 열" })
  accountAliasIdx: string;

  @ApiProperty({ example: "C", description: "입금액 엑셀 열" })
  withdrawalAmountIdx: string;

  @ApiProperty({ example: "D", description: "계좌 적요 엑셀 열" })
  accountDescriptionIdx: string;

  @ApiProperty({ example: "E", description: "거래수단1 엑셀 열" })
  transactionMethod1Idx: string;

  @ApiProperty({ example: "F", description: "거래수단2 엑셀 열" })
  transactionMethod2Idx: string;

  @ApiProperty({ example: "G", description: "계좌 메모 엑셀 열" })
  accountMemoIdx: string;

  @ApiProperty({ example: "I", description: "용도 엑셀 열" })
  purposeIdx: string;

  @ApiProperty({ example: "J", description: "거래처 엑셀 열" })
  clientNameIdx: string;
}
