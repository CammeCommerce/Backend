import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeepPartial, In, Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import * as XLSX from "xlsx";
import { Withdrawal } from "../entity/withdrawal.entity";
import { WithdrawalMatching } from "../../withdrawal-matching/entity/withdrawal-matching.entity";
import { WithdrawalColumnIndex } from "../entity/withdrawal-column-index.entity";
import { GetWithdrawalColumnIndexDto } from "../dto/response/get-withdrawal-column-index.dto";
import {
  GetWithdrawalDto,
  WithdrawalDetailDto,
} from "../dto/response/get-withdrawal.dto";
import { ModifyWithdrawalDto } from "../dto/request/modify-withdrawal.dto";
import { ModifyWithdrawalResultDto } from "../dto/response/modify-withdrawal-result.dto";

@Injectable()
export class WithdrawalService {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(WithdrawalMatching)
    private readonly withdrawalMatchingRepository: Repository<WithdrawalMatching>,
    @InjectRepository(WithdrawalColumnIndex)
    private readonly withdrawalColumnIndexRepository: Repository<WithdrawalColumnIndex>
  ) {}

  // 엑셀 열 이름을 숫자 인덱스로 변환하는 메서드
  private columnToIndex(column: string): number {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + column.charCodeAt(i) - "A".charCodeAt(0) + 1;
    }
    return index - 1;
  }

  // 파싱된 출금값 등록
  async saveParsedWithdrawals(parsedWithdrawals: any[]): Promise<void> {
    for (const withdrawalData of parsedWithdrawals) {
      const withdrawalEntity: DeepPartial<Withdrawal> = {
        ...withdrawalData,
      };

      const withdrawal = this.withdrawalRepository.create(withdrawalEntity);
      await this.withdrawalRepository.save(withdrawal);
    }
  }

  // 매체명 매칭하는 메서드
  async matchWithdrawals(): Promise<void> {
    const unmatchedWithdrawal = await this.withdrawalRepository.find({
      where: [{ mediumName: null, isDeleted: false }],
    });

    if (!unmatchedWithdrawal.length) {
      return;
    }

    for (const withdrawal of unmatchedWithdrawal) {
      const matchedRecord = await this.withdrawalMatchingRepository.findOne({
        where: {
          accountAlias: withdrawal.accountAlias,
          purpose: withdrawal.purpose,
          isDeleted: false,
        },
      });

      if (matchedRecord) {
        withdrawal.mediumName = matchedRecord.mediumName;
        withdrawal.isMediumMatched = !!withdrawal.mediumName;

        await this.withdrawalRepository.save(withdrawal);
      }
    }
  }

  // 열 인덱스 저장 메서드
  async saveWithdrawalColumnIndex(
    columnIndexes: DeepPartial<WithdrawalColumnIndex>
  ): Promise<void> {
    const existingIndexes = await this.withdrawalColumnIndexRepository.find();
    if (existingIndexes && existingIndexes.length > 0) {
      await this.withdrawalColumnIndexRepository.update(
        existingIndexes[0].id,
        columnIndexes
      );
    } else {
      await this.withdrawalColumnIndexRepository.save(columnIndexes);
    }
  }

  // 엑셀 파일 파싱 및 출금값 저장 메서드
  async parseExcelAndSaveWithdrawals(
    file: Express.Multer.File,
    withdrawalDateIndex: string,
    accountAliasIndex: string,
    withdrawalAmountIndex: string,
    accountDescriptionIndex: string,
    transactionMethod1Index: string,
    transactionMethod2Index: string,
    accountMemoIndex: string,
    purposeIndex: string,
    clientNameIndex: string
  ): Promise<void> {
    // 엑셀 열 인덱스 저장
    const withdrawalColumnIndexes: DeepPartial<WithdrawalColumnIndex> = {
      withdrawalDateIdx: withdrawalDateIndex,
      accountAliasIdx: accountAliasIndex,
      withdrawalAmountIdx: withdrawalAmountIndex,
      accountDescriptionIdx: accountDescriptionIndex,
      transactionMethod1Idx: transactionMethod1Index,
      transactionMethod2Idx: transactionMethod2Index,
      accountMemoIdx: accountMemoIndex,
      purposeIdx: purposeIndex,
      clientNameIdx: clientNameIndex,
    };

    // 열 인덱스 저장
    await this.saveWithdrawalColumnIndex(withdrawalColumnIndexes);

    // 엑셀 파일 파싱
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!jsonData || jsonData.length < 2) {
      throw new BadRequestException("엑셀 파일의 데이터가 유효하지 않습니다.");
    }

    // 엑셀 열 인덱스 문자열을 숫자 인덱스로 변환
    const withdrawalDateIdx = this.columnToIndex(withdrawalDateIndex);
    const accountAliasIdx = this.columnToIndex(accountAliasIndex);
    const withdrawalAmountIdx = this.columnToIndex(withdrawalAmountIndex);
    const accountDescriptionIdx = this.columnToIndex(accountDescriptionIndex);
    const transactionMethod1Idx = this.columnToIndex(transactionMethod1Index);
    const transactionMethod2Idx = this.columnToIndex(transactionMethod2Index);
    const accountMemoIdx = this.columnToIndex(accountMemoIndex);
    const purposeIdx = this.columnToIndex(purposeIndex);
    const clientNameIdx = this.columnToIndex(clientNameIndex);

    const withdrawals = [];

    // 첫 번째 행(헤더)을 제외하고 각 데이터 행을 처리
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // 공란 데이터 검증
      const missingFields = [];
      if (!row[accountAliasIdx]) missingFields.push("계좌별칭");
      if (!row[purposeIdx]) missingFields.push("용도");

      if (missingFields.length > 0) {
        throw new BadRequestException(
          `엑셀 공란 값: ${missingFields.join(", ")} (${i + 1}행)`
        );
      }

      // parseInt를 사용하여 숫자 필드를 변환하고 NaN 발생 시 기본값 설정
      const withdrawalAmount = parseInt(row[withdrawalAmountIdx], 10) || 0;

      const withdrawal = {
        mediumName: null,
        withdrawalDate: row[withdrawalDateIdx],
        accountAlias: row[accountAliasIdx],
        withdrawalAmount,
        accountDescription: row[accountDescriptionIdx],
        transactionMethod1: row[transactionMethod1Idx],
        transactionMethod2: row[transactionMethod2Idx],
        accountMemo: row[accountMemoIdx],
        purpose: row[purposeIdx],
        clientName: row[clientNameIdx],
        isMediumMatched: false,
      };

      // 매체명이 비어 있을 경우, 계좌별칭과 용도를 기준으로 자동 매칭
      if (!withdrawal.mediumName) {
        const matchedRecord = await this.withdrawalMatchingRepository.findOne({
          where: {
            accountAlias: withdrawal.accountAlias,
            purpose: withdrawal.purpose,
          },
        });

        if (matchedRecord) {
          withdrawal.mediumName = matchedRecord.mediumName;
          withdrawal.isMediumMatched = !!withdrawal.mediumName;
        }
      }

      withdrawals.push(withdrawal);
    }

    // 파싱된 출금값 저장
    await this.saveParsedWithdrawals(withdrawals);

    // 출금 저장 후 매칭되지 않은 주문을 다시 확인하고 매칭하는 로직
    await this.matchWithdrawals();
  }

  // 열 인덱스 조회 메서드
  async getWithdrawalColumnIndex(): Promise<GetWithdrawalColumnIndexDto> {
    const columnIndexes = await this.withdrawalColumnIndexRepository.find();

    if (!columnIndexes || columnIndexes.length === 0) {
      throw new NotFoundException("저장된 열 인덱스가 없습니다.");
    }

    // 조회한 열 인덱스를 DTO로 변환하여 반환
    return plainToInstance(GetWithdrawalColumnIndexDto, columnIndexes[0]);
  }

  // 출금값 조회
  async getWithdrawals(): Promise<GetWithdrawalDto> {
    // 매칭되지 않은 출금들에 대해 매칭 로직을 수행
    await this.matchWithdrawals();

    const withdrawals = await this.withdrawalRepository.find({
      where: { isDeleted: false },
      order: { createdAt: "ASC" },
    });

    if (!withdrawals) {
      throw new NotFoundException("등록된 출금값이 없습니다.");
    }

    const items = withdrawals.map((withdrawal) =>
      plainToInstance(WithdrawalDetailDto, {
        id: withdrawal.id,
        mediumName: withdrawal.mediumName,
        withdrawalDate: withdrawal.withdrawalDate,
        accountAlias: withdrawal.accountAlias,
        withdrawalAmount: withdrawal.withdrawalAmount,
        accountDescription: withdrawal.accountDescription,
        transactionMethod1: withdrawal.transactionMethod1,
        transactionMethod2: withdrawal.transactionMethod2,
        accountMemo: withdrawal.accountMemo,
        purpose: withdrawal.purpose,
        clientName: withdrawal.clientName,
        isMediumMatched: withdrawal.isMediumMatched,
      })
    );

    // 출금 배열 DTO 생성
    const withdrawalItemsDto = new GetWithdrawalDto();
    withdrawalItemsDto.items = items;

    return withdrawalItemsDto;
  }

  // 출금 ID로 상세 조회 메서드
  async getWithdrawalDetailById(id: number): Promise<WithdrawalDetailDto> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!withdrawal) {
      throw new NotFoundException(`ID가 ${id}인 출금값을 찾을 수 없습니다.`);
    }

    // 출금 데이터를 DTO로 변환
    return plainToInstance(WithdrawalDetailDto, {
      id: withdrawal.id,
      mediumName: withdrawal.mediumName,
      withdrawalDate: withdrawal.withdrawalDate,
      accountAlias: withdrawal.accountAlias,
      withdrawalAmount: withdrawal.withdrawalAmount,
      accountDescription: withdrawal.accountDescription,
      transactionMethod1: withdrawal.transactionMethod1,
      transactionMethod2: withdrawal.transactionMethod2,
      accountMemo: withdrawal.accountMemo,
      purpose: withdrawal.purpose,
      clientName: withdrawal.clientName,
      isMediumMatched: withdrawal.isMediumMatched,
    });
  }

  // 출금 검색 및 필터링
  async searchWithdrawals(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    isMediumMatched: any,
    searchQuery: string
  ): Promise<GetWithdrawalDto> {
    const queryBuilder = this.withdrawalRepository
      .createQueryBuilder("withdrawal")
      .where("withdrawal.isDeleted = false");

    // 시작 날짜와 종료 날짜를 시간 없이 날짜만으로 비교
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "DATE(withdrawal.withdrawalDate) BETWEEN :startDate AND :endDate",
        {
          startDate: startDate.toISOString().split("T")[0], // 날짜 부분만 추출
          endDate: endDate.toISOString().split("T")[0],
        }
      );
    } else if (startDate) {
      // 종료 날짜가 없을 때 시작 날짜로만 조회
      queryBuilder.andWhere("DATE(withdrawal.withdrawalDate) = :startDate", {
        startDate: startDate.toISOString().split("T")[0],
      });
    }

    // 매체명 매칭 여부 필터
    if (isMediumMatched !== undefined && isMediumMatched !== null) {
      const isMediumMatchedBoolean = isMediumMatched === "true";
      queryBuilder.andWhere("withdrawal.isMediumMatched = :isMediumMatched", {
        isMediumMatched: isMediumMatchedBoolean,
      });
    }

    // 매체명 검색 조건
    if (mediumName) {
      queryBuilder.andWhere("withdrawal.mediumName LIKE :mediumName", {
        mediumName: `%${mediumName}%`,
      });
    }

    // 계좌별칭 또는 용도 검색 조건
    if (searchQuery) {
      queryBuilder.andWhere(
        "(withdrawal.accountAlias LIKE :searchQuery OR withdrawal.purpose LIKE :searchQuery)",
        { searchQuery: `%${searchQuery}%` }
      );
    }

    // 기간 필터
    const now = new Date();
    switch (periodType) {
      case "어제":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        queryBuilder.andWhere(
          "withdrawal.withdrawalDate BETWEEN :start AND :end",
          {
            start: yesterday,
            end: now,
          }
        );
        break;
      case "지난 3일":
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        queryBuilder.andWhere(
          "withdrawal.withdrawalDate BETWEEN :start AND :end",
          {
            start: threeDaysAgo,
            end: now,
          }
        );
        break;
      case "일주일":
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(now.getDate() - 7);
        queryBuilder.andWhere(
          "withdrawal.withdrawalDate BETWEEN :start AND :end",
          {
            start: oneWeekAgo,
            end: now,
          }
        );
        break;
      case "1개월":
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        queryBuilder.andWhere(
          "withdrawal.withdrawalDate BETWEEN :start AND :end",
          {
            start: oneMonthAgo,
            end: now,
          }
        );
        break;
      case "3개월":
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        queryBuilder.andWhere(
          "withdrawal.withdrawalDate BETWEEN :start AND :end",
          {
            start: threeMonthsAgo,
            end: now,
          }
        );
        break;
      case "6개월":
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        queryBuilder.andWhere(
          "withdrawal.withdrawalDate BETWEEN :start AND :end",
          {
            start: sixMonthsAgo,
            end: now,
          }
        );
        break;
      default:
        break;
    }

    const withdrawals = await queryBuilder.getMany();

    if (!withdrawals.length) {
      throw new NotFoundException("검색 조건에 맞는 출금값이 없습니다.");
    }

    const items = withdrawals.map((withdrawal) =>
      plainToInstance(WithdrawalDetailDto, {
        id: withdrawal.id,
        mediumName: withdrawal.mediumName,
        withdrawalDate: withdrawal.withdrawalDate,
        accountAlias: withdrawal.accountAlias,
        withdrawalAmount: withdrawal.withdrawalAmount,
        accountDescription: withdrawal.accountDescription,
        transactionMethod1: withdrawal.transactionMethod1,
        transactionMethod2: withdrawal.transactionMethod2,
        accountMemo: withdrawal.accountMemo,
        purpose: withdrawal.purpose,
        clientName: withdrawal.clientName,
        isMediumMatched: withdrawal.isMediumMatched,
      })
    );

    const withdrawalItemsDto = new GetWithdrawalDto();
    withdrawalItemsDto.items = items;

    return withdrawalItemsDto;
  }

  // 검색된 출금 데이터를 엑셀로 다운로드
  async downloadWithdrawalsExcel(
    startDate: Date,
    endDate: Date,
    periodType: string,
    mediumName: string,
    isMediumMatched: any,
    searchQuery: string
  ): Promise<Buffer> {
    const withdrawalDto = await this.searchWithdrawals(
      startDate,
      endDate,
      periodType,
      mediumName,
      isMediumMatched,
      searchQuery
    );

    // 엑셀에 포함할 필드만 추출
    const dataForExcel = withdrawalDto.items.map((withdrawal) => ({
      매체명: withdrawal.mediumName,
      출금일자: withdrawal.withdrawalDate,
      "계좌 별칭": withdrawal.accountAlias,
      출금액: withdrawal.withdrawalAmount,
      "계좌 적요": withdrawal.accountDescription,
      거래수단1: withdrawal.transactionMethod1,
      거래수단2: withdrawal.transactionMethod2,
      "계좌 메모": withdrawal.accountMemo,
      용도: withdrawal.purpose,
      거래처: withdrawal.clientName,
    }));

    // 엑셀 데이터 생성
    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Withdrawals");

    // 엑셀 파일 버퍼 생성
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    return excelBuffer;
  }

  // 출금값 수정
  async modifyWithdrawal(
    id: number,
    dto: ModifyWithdrawalDto
  ): Promise<ModifyWithdrawalResultDto> {
    const withdrawal = await this.withdrawalRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!withdrawal) {
      throw new NotFoundException("출금값을 찾을 수 없습니다.");
    }

    // 매칭 정보 해제 후, 독립적으로 필드 수정
    withdrawal.isMediumMatched = false;
    withdrawal.mediumName = dto.mediumName ?? withdrawal.mediumName;
    withdrawal.withdrawalDate = dto.withdrawalDate ?? withdrawal.withdrawalDate;
    withdrawal.accountAlias = dto.accountAlias ?? withdrawal.accountAlias;
    withdrawal.withdrawalAmount =
      dto.withdrawalAmount ?? withdrawal.withdrawalAmount;
    withdrawal.accountDescription =
      dto.accountDescription ?? withdrawal.accountDescription;
    withdrawal.transactionMethod1 =
      dto.transactionMethod1 ?? withdrawal.transactionMethod1;
    withdrawal.transactionMethod2 =
      dto.transactionMethod2 ?? withdrawal.transactionMethod2;
    withdrawal.accountMemo = dto.accountMemo ?? withdrawal.accountMemo;
    withdrawal.purpose = dto.purpose ?? withdrawal.purpose;
    withdrawal.clientName = dto.clientName ?? withdrawal.clientName;
    withdrawal.updatedAt = new Date();

    // 매칭 정보를 무시하고 독립적으로 현재 엔트리만 업데이트
    await this.withdrawalRepository.save(withdrawal);

    const modifyWithdrawalResultDto = plainToInstance(
      ModifyWithdrawalResultDto,
      {
        id: withdrawal.id,
        mediumName: withdrawal.mediumName,
        withdrawalDate: withdrawal.withdrawalDate,
        accountAlias: withdrawal.accountAlias,
        withdrawalAmount: withdrawal.withdrawalAmount,
        accountDescription: withdrawal.accountDescription,
        transactionMethod1: withdrawal.transactionMethod1,
        transactionMethod2: withdrawal.transactionMethod2,
        accountMemo: withdrawal.accountMemo,
        purpose: withdrawal.purpose,
        clientName: withdrawal.clientName,
        updatedAt: withdrawal.updatedAt,
      }
    );

    return modifyWithdrawalResultDto;
  }

  // 출금값 삭제
  async deleteWithdrawals(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException("삭제할 출금 ID가 없습니다.");
    }

    const withdrawals = await this.withdrawalRepository.find({
      where: {
        id: In(ids),
        isDeleted: false,
      },
    });

    if (withdrawals.length !== ids.length) {
      throw new NotFoundException("일부 출금을 찾을 수 없습니다.");
    }

    for (const withdrawal of withdrawals) {
      withdrawal.deletedAt = new Date();
      withdrawal.isDeleted = true;
      await this.withdrawalRepository.save(withdrawal);
    }

    return;
  }
}
