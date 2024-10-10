import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Withdrawal extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "출금 ID" })
  id: number;
}
