import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class Withdrawal extends BaseEntity {
  @Column({ comment: "매체명" })
  mediumName: string;

  @Column({ comment: "출금일자" })
  withdrawalDate: string;

  @Column({ comment: "계좌 별칭" })
  accountAlias: string;

  @Column({ comment: "출금액" })
  withdrawalAmount: number;

  @Column({ comment: "계좌 적요" })
  accountDescription: string;

  @Column({ comment: "거래수단1" })
  transactionMethod1: string;

  @Column({ comment: "거래수단2" })
  transactionMethod2: string;

  @Column({ comment: "계좌 메모" })
  accountMemo: string;

  @Column({ comment: "용도" })
  purpose: string;

  @Column({ comment: "거래처" })
  clientName: string;
}
