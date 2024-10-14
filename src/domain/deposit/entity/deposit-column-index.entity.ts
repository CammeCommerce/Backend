import { Column, Entity } from "typeorm";
import { BaseEntity } from "src/global/base.entity";

@Entity()
export class DepositColumnIndex extends BaseEntity {
  @Column({ comment: "입금일자 엑셀 열" })
  depositDateIdx: string;

  @Column({ comment: "계좌 별칭 엑셀 열" })
  accountAliasIdx: string;

  @Column({ comment: "입금액 엑셀 열" })
  depositAmountIdx: string;

  @Column({ comment: "계좌 적요 엑셀 열" })
  accountDescriptionIdx: string;

  @Column({ comment: "거래수단1 엑셀 열" })
  transactionMethod1Idx: string;

  @Column({ comment: "거래수단2 엑셀 열" })
  transactionMethod2Idx: string;

  @Column({ comment: "계좌 메모 엑셀 열" })
  accountMemoIdx: string;

  @Column({ comment: "상대 계좌 예금주명 엑셀 열" })
  counterpartyNameIdx: string;

  @Column({ comment: "용도 엑셀 열" })
  purposeIdx: string;

  @Column({ comment: "거래처 엑셀 열" })
  clientNameIdx: string;
}
