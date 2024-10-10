import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Medium extends BaseEntity {
  @PrimaryGeneratedColumn({ comment: "매체 ID" })
  id: number;

  @Column({ comment: "매체명" })
  name: string;
}
