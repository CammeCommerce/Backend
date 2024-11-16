import { Column, Entity } from "typeorm";
import { BaseEntity } from "../../../global/base.entity";

@Entity()
export class WithdrawalColumnIndex extends BaseEntity {
  @Column({ comment: "입금일자 엑셀 열" })
  withdrawalDateIdx: string;

  @Column({ comment: "계좌 별칭 엑셀 열" })
  accountAliasIdx: string;

  @Column({ comment: "입금액 엑셀 열" })
  withdrawalAmountIdx: string;

  @Column({ comment: "계좌 적요 엑셀 열" })
  accountDescriptionIdx: string;

  @Column({ comment: "거래수단1 엑셀 열" })
  transactionMethod1Idx: string;

  @Column({ comment: "거래수단2 엑셀 열" })
  transactionMethod2Idx: string;

  @Column({ comment: "계좌 메모 엑셀 열" })
  accountMemoIdx: string;

  @Column({ comment: "용도 엑셀 열" })
  purposeIdx: string;

  @Column({ comment: "거래처 엑셀 열" })
  clientNameIdx: string;
}
