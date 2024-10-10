import {
  CreateDateColumn,
  DeleteDateColumn,
  BaseEntity as TypeOrmBaseEntity,
  UpdateDateColumn,
} from "typeorm";

export abstract class BaseEntity extends TypeOrmBaseEntity {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deletedAt: Date | null;
}
