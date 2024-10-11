import { ApiProperty } from "@nestjs/swagger";
import { TaxType } from "src/global/enum/tax-type.enum";

export class ModifyOrderResultDto {
  @ApiProperty({ example: 1, description: "주문 ID" })
  id: number;

  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  mediumName: string;

  @ApiProperty({ example: "캄므>포앤_마진만", description: "정산업체명" })
  settleCompanyName: string;

  @ApiProperty({ example: "상품명", description: "상품명" })
  productName: string;

  @ApiProperty({ example: 10, description: "수량" })
  quantity: number;

  @ApiProperty({ example: "2024-10-10", description: "발주일자" })
  orderDate: string;

  @ApiProperty({ example: "우리동네", description: "매입처" })
  purchasePlace: string;

  @ApiProperty({ example: "해안유통", description: "매출처" })
  salesPlace: string;

  @ApiProperty({ example: 15000, description: "매입가" })
  purchasePrice: number;

  @ApiProperty({ example: 20000, description: "판매가" })
  salesPrice: number;

  @ApiProperty({ example: 3000, description: "매입 배송비" })
  purchaseShippingFee: number;

  @ApiProperty({ example: 6000, description: "매출 배송비" })
  salesShippingFee: number;

  @ApiProperty({ enum: TaxType, description: "과세여부" })
  taxType: TaxType;

  @ApiProperty({ example: 5000, description: "마진액" })
  marginAmount: number;

  @ApiProperty({ example: 3000, description: "배송차액" })
  shippingDifference: number;
}
