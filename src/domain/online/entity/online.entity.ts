import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Online extends BaseEntity {
  @Column({ comment: "매출 발생 월" })
  salesMonth: string;

  @Column({ comment: "매체명" })
  mediumName: string;

  @Column({ comment: "온라인 매체명" })
  onlineCompanyName: string;

  @Column({ comment: "매출액" })
  salesAmount: number;

  @Column({ comment: "매입액" })
  purchaseAmount: number;

  @Column({ comment: "마진액" })
  marginAmount: number;

  @Column({ comment: "메모" })
  memo: string;
}
