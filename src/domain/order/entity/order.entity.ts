import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Order extends BaseEntity {
  @Column({ comment: "매체명", nullable: true })
  mediumName: string;

  @Column({ comment: "정산업체명", nullable: true })
  settlementCompanyName: string;

  @Column({ comment: "상품명" })
  productName: string;

  @Column({ comment: "수량" })
  quantity: number;

  @Column({ comment: "발주일자" })
  orderDate: string;

  @Column({ comment: "매입처" })
  purchasePlace: string;

  @Column({ comment: "매출처" })
  salesPlace: string;

  @Column({ comment: "매입가" })
  purchasePrice: number;

  @Column({ comment: "판매가" })
  salesPrice: number;

  @Column({ comment: "매입 배송비" })
  purchaseShippingFee: number;

  @Column({ comment: "매출 배송비" })
  salesShippingFee: number;

  @Column({ comment: "과세여부" })
  taxType: string;

  @Column({ comment: "마진액" })
  marginAmount: number;

  @Column({ comment: "배송차액" })
  shippingDifference: number;

  @Column({ comment: "매체명 매칭 여부", default: false })
  isMediumMatched: boolean;

  @Column({ comment: "정산업체명 매칭 여부", default: false })
  isSettlementCompanyMatched: boolean;
}
