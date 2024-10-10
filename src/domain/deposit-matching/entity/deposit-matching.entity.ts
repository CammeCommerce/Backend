import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class DepositMatching extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "응모 매칭 ID" })
  id: number;
}
