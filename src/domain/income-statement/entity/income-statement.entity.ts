import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class IncomeStatement extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "손익계산서 ID" })
  id: number;
}
