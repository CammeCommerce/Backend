import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Medium extends BaseEntity {
  @Column({ comment: "매체명" })
  name: string;
}
