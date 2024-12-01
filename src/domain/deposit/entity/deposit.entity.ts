import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../global/base.entity";

@Entity()
export class Deposit extends BaseEntity {
  @Column({ comment: "매체명", nullable: true })
  mediumName: string;

  @Column({ comment: "입금일자", nullable: true })
  depositDate: string;

  @Column({ comment: "계좌 별칭", nullable: true })
  accountAlias: string;

  @Column({ comment: "입금액", nullable: true })
  depositAmount: number;

  @Column({ comment: "계좌 적요", nullable: true })
  accountDescription: string;

  @Column({ comment: "거래수단1", nullable: true })
  transactionMethod1: string;

  @Column({ comment: "거래수단2", nullable: true })
  transactionMethod2: string;

  @Column({ comment: "계좌 메모", nullable: true })
  accountMemo: string;

  @Column({ comment: "상대 계좌 예금주명", nullable: true })
  counterpartyName: string;

  @Column({ comment: "용도", nullable: true })
  purpose: string;

  @Column({ comment: "거래처", nullable: true })
  clientName: string;

  @Column({ comment: "매체명 매칭 여부", default: false })
  isMediumMatched: boolean;
}
