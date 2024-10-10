import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class SettlementCompany extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "정산업체 ID" })
  id: number;
}
