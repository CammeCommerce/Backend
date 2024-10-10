import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Deposit extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "응모 ID" })
  id: number;
}
