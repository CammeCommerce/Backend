import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsString } from "class-validator";
import { TaxType } from "src/global/enum/tax-type.enum";

export class CreateOrderDto {
  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  @IsString()
  mediumName: string;

  @ApiProperty({ example: "캄므>포앤_마진만", description: "정산업체명" })
  @IsString()
  settleCompanyName: string;

  @ApiProperty({ example: "상품명", description: "상품명" })
  @IsString()
  productName: string;

  @ApiProperty({ example: 10, description: "수량" })
  @IsInt()
  quantity: number;

  @ApiProperty({ example: "2024-10-10", description: "발주일자" })
  @IsString()
  orderDate: string;

  @ApiProperty({ example: "우리동네", description: "매입처" })
  @IsString()
  purchasePlace: string;

  @ApiProperty({ example: "해안유통", description: "매출처" })
  @IsString()
  salesPlace: string;

  @ApiProperty({ example: 15000, description: "매입가" })
  @IsInt()
  purchasePrice: number;

  @ApiProperty({ example: 20000, description: "판매가" })
  @IsInt()
  salesPrice: number;

  @ApiProperty({ example: 3000, description: "매입 배송비" })
  @IsInt()
  purchaseShippingFee: number;

  @ApiProperty({ example: 6000, description: "매출 배송비" })
  @IsInt()
  salesShippingFee: number;

  @ApiProperty({ example: 11, description: "과세여부" })
  @IsEnum(TaxType)
  taxType: TaxType;
}
