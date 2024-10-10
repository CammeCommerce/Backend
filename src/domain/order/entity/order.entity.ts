import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "주문 ID" })
  id: number;
}
