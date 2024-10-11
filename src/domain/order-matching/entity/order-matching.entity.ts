import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class OrderMatching extends BaseEntity {
  @Column({ comment: "매체명" })
  mediumName: string;

  @Column({ comment: "정산업체명" })
  settlementCompanyName: string;

  @Column({ comment: "매입처" })
  purchasePlace: string;

  @Column({ comment: "매출처" })
  salesPlace: string;
}
