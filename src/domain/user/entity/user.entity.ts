import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "유저 ID" })
  id: number;
}
