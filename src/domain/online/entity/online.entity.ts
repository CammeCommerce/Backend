import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Online extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "온라인 ID" })
  id: number;
}
