import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class OrderMatching extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "주문 매칭 ID" })
  id: number;
}
