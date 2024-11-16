import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../global/base.entity";

@Entity()
export class WithdrawalMatching extends BaseEntity {
  @Column({ comment: "매체명" })
  mediumName: string;

  @Column({ comment: "계좌 별칭" })
  accountAlias: string;

  @Column({ comment: "용도" })
  purpose: string;
}
