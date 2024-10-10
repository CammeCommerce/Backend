import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class WithdrawalMatching extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "출금 매칭 ID" })
  id: number;
}
