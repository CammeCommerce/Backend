import { ApiProperty } from "@nestjs/swagger";

export class GetProfitLossDto {
  @ApiProperty({ example: "캄므커머스", description: "매체명" })
  medium: string;

  @ApiProperty({ example: "2024-09 ~ 2024-10", description: "기간" })
  period: string;

  @ApiProperty({ example: 1000000, description: "도매 매출" })
  wholesaleSales: number;

  @ApiProperty({ example: 1000000, description: "도매 배송비" })
  wholesaleShippingFee: number;

  @ApiProperty({ example: 1000000, description: "입금 용도명: 입금 총합" })
  depositByPurpose: Record<string, number>;

  @ApiProperty({
    example: 1000000,
    description: "온라인 매체명: 온라인 매출액 총합",
  })
  onlineSalesByMedia: Record<string, number>;

  @ApiProperty({ example: 1000000, description: "도매 매입" })
  wholesalePurchase: number;

  @ApiProperty({ example: 1000000, description: "도매 매입 배송비" })
  wholesalePurchaseShippingFee: number;

  @ApiProperty({ example: 1000000, description: "출금 용도명: 출금 총합" })
  withdrawalByPurpose: Record<string, number>;

  @ApiProperty({
    example: 1000000,
    description: "온라인 매체명: 온라인 매입액 총합",
  })
  onlinePurchaseByMedia: Record<string, number>;
}
