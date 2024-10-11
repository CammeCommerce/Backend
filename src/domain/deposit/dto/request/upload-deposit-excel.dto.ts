import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UploadDepositExcelDto {
  @ApiProperty({
    type: "string",
    format: "binary",
    description: "업로드할 엑셀 파일",
  })
  file: any;

  @ApiProperty({ example: "A", description: "입금일자 열 인덱스" })
  @IsString()
  depositDateIndex: string;

  @ApiProperty({ example: "B", description: "계좌 별칭 열 인덱스" })
  @IsString()
  accountAliasIndex: string;

  @ApiProperty({ example: "C", description: "입금액 열 인덱스" })
  @IsString()
  depositAmountIndex: string;

  @ApiProperty({ example: "D", description: "계좌 적요 열 인덱스" })
  @IsString()
  accountDescriptionIndex: string;

  @ApiProperty({ example: "E", description: "거래수단1 열 인덱스" })
  @IsString()
  transactionMethod1Index: string;

  @ApiProperty({ example: "F", description: "거래수단2 열 인덱스" })
  @IsString()
  transactionMethod2Index: string;

  @ApiProperty({ example: "G", description: "계좌 메모 열 인덱스" })
  @IsString()
  accountMemoIndex: string;

  @ApiProperty({ example: "H", description: "상대 계좌 예금주명 열 인덱스" })
  @IsString()
  counterpartyNameIndex: string;

  @ApiProperty({ example: "I", description: "용도 열 인덱스" })
  @IsString()
  purposeIndex: string;

  @ApiProperty({ example: "J", description: "거래처 열 인덱스" })
  @IsString()
  clientNameIndex: string;
}
