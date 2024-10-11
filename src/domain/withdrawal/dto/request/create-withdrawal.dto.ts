import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString } from "class-validator";

export class CreateWithdrawalDto {
  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  @IsString()
  mediumName: string;

  @ApiProperty({ example: "2024-10-10", description: "출금일자" })
  @IsString()
  withdrawalDate: string;

  @ApiProperty({ example: "우리동네", description: "계좌 별칭" })
  @IsString()
  accountAlias: string;

  @ApiProperty({ example: 20000, description: "출금액" })
  @IsInt()
  withdrawalAmount: number;

  @ApiProperty({ example: "계좌 적요", description: "계좌 적요" })
  @IsString()
  accountDescription: string;

  @ApiProperty({ example: "거래수단1", description: "거래수단1" })
  @IsString()
  transactionMethod1: string;

  @ApiProperty({ example: "거래수단2", description: "거래수단2" })
  @IsString()
  transactionMethod2: string;

  @ApiProperty({ example: "계좌 메모", description: "계좌 메모" })
  @IsString()
  accountMemo: string;

  @ApiProperty({ example: "용도", description: "용도" })
  @IsString()
  purpose: string;

  @ApiProperty({ example: "거래처", description: "거래처" })
  @IsString()
  clientName: string;
}
