import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../global/base.entity";

@Entity()
export class SettlementCompany extends BaseEntity {
  @Column({ comment: "정산업체명" })
  name: string;
}
