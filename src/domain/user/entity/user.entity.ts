import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../global/base.entity";

@Entity()
export class User extends BaseEntity {
  @Column({ comment: "이메일" })
  email: string;

  @Column({ comment: "비밀번호" })
  password: string;
}
