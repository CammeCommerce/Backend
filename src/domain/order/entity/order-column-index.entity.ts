import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../global/base.entity";

@Entity()
export class OrderColumnIndex extends BaseEntity {
  @Column({ comment: "상품명 엑셀 열" })
  productNameIndex: string;

  @Column({ comment: "수량 엑셀 열" })
  quantityIndex: string;

  @Column({ comment: "발주일자 엑셀 열" })
  orderDateIndex: string;

  @Column({ comment: "매입처 엑셀 열" })
  purchasePlaceIndex: string;

  @Column({ comment: "매출처 엑셀 열" })
  salesPlaceIndex: string;

  @Column({ comment: "매입가 엑셀 열" })
  purchasePriceIndex: string;

  @Column({ comment: "판매가 엑셀 열" })
  salesPriceIndex: string;

  @Column({ comment: "매입 배송비 엑셀 열" })
  purchaseShippingFeeIndex: string;

  @Column({ comment: "매출 배송비 엑셀 열" })
  salesShippingFeeIndex: string;

  @Column({ comment: "과세여부 엑셀 열" })
  taxTypeIndex: string;
}
