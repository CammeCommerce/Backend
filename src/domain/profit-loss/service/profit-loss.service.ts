import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "src/domain/order/entity/order.entity";
import { Deposit } from "src/domain/deposit/entity/deposit.entity";
import { Withdrawal } from "src/domain/withdrawal/entity/withdrawal.entity";
import { Online } from "src/domain/online/entity/online.entity";
import { GetProfitLossDto } from "src/domain/profit-loss/dto/response/get-profit-loss.dto";

@Injectable()
export class ProfitLossService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Deposit)
    private readonly depositRepository: Repository<Deposit>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalRepository: Repository<Withdrawal>,
    @InjectRepository(Online)
    private readonly onlineRepository: Repository<Online>
  ) {}

  async getProfitLoss(
    startDate: string,
    endDate: string,
    mediumName: string
  ): Promise<GetProfitLossDto> {
    // 각 값이 매번 새로 초기화되도록 명시적으로 0으로 설정
    let wholesaleSales = 0;
    let wholesaleShippingFee = 0;
    let depositByPurpose: Record<string, number> = {};
    let onlineSalesByMedia: Record<string, number> = {};

    let wholesalePurchase = 0;
    let wholesalePurchaseShippingFee = 0;
    let withdrawalByPurpose: Record<string, number> = {};
    let onlinePurchaseByMedia: Record<string, number> = {};

    // 연도와 월을 추출
    const [startYear, startMonth] = startDate.split("-").map(Number);
    const [endYear, endMonth] = endDate.split("-").map(Number);

    const queryConditions = {
      startYear,
      startMonth,
      endYear,
      endMonth,
      mediumName,
    };

    // 각 계산 메서드에서 값 할당
    wholesaleSales = await this.calculateWholesaleSales(queryConditions);
    wholesaleShippingFee =
      await this.calculateWholesaleShippingFee(queryConditions);
    depositByPurpose = await this.calculateDepositByPurpose(queryConditions);
    onlineSalesByMedia = await this.calculateOnlineSales(queryConditions);

    wholesalePurchase = await this.calculateWholesalePurchase(queryConditions);
    wholesalePurchaseShippingFee =
      await this.calculateWholesalePurchaseShippingFee(queryConditions);
    withdrawalByPurpose =
      await this.calculateWithdrawalByPurpose(queryConditions);
    onlinePurchaseByMedia = await this.calculateOnlinePurchase(queryConditions);

    // 총 매출과 총 매입 합계 계산
    const totalSales =
      wholesaleSales +
      wholesaleShippingFee +
      Object.values(depositByPurpose).reduce((a, b) => a + b, 0) +
      Object.values(onlineSalesByMedia).reduce((a, b) => a + b, 0);

    const totalPurchases =
      wholesalePurchase +
      wholesalePurchaseShippingFee +
      Object.values(withdrawalByPurpose).reduce((a, b) => a + b, 0) +
      Object.values(onlinePurchaseByMedia).reduce((a, b) => a + b, 0);

    const netProfitOrLoss = totalSales - totalPurchases;

    return {
      mediumName: mediumName,
      period: `${startDate} ~ ${endDate}`,
      wholesaleSales,
      wholesaleShippingFee,
      depositByPurpose,
      onlineSalesByMedia,
      wholesalePurchase,
      wholesalePurchaseShippingFee,
      withdrawalByPurpose,
      onlinePurchaseByMedia,
      netProfitOrLoss,
    };
  }

  // 도매 매출 계산
  private async calculateWholesaleSales(queryConditions: any): Promise<number> {
    const { startYear, startMonth, endYear, endMonth, mediumName } =
      queryConditions;
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.salesPrice)", "total")
      .where("YEAR(order.createdAt) BETWEEN :startYear AND :endYear", {
        startYear,
        endYear,
      })
      .andWhere("MONTH(order.createdAt) BETWEEN :startMonth AND :endMonth", {
        startMonth,
        endMonth,
      })
      .andWhere("order.isMediumMatched = true")
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .andWhere("order.isDeleted = false")
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  // 도매 배송비 계산
  private async calculateWholesaleShippingFee(
    queryConditions: any
  ): Promise<number> {
    const { startYear, startMonth, endYear, endMonth, mediumName } =
      queryConditions;
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.salesShippingFee)", "total")
      .where("YEAR(order.createdAt) BETWEEN :startYear AND :endYear", {
        startYear,
        endYear,
      })
      .andWhere("MONTH(order.createdAt) BETWEEN :startMonth AND :endMonth", {
        startMonth,
        endMonth,
      })
      .andWhere("order.isMediumMatched = true")
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .andWhere("order.isDeleted = false")
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  // 입금 내역 용도별로 계산
  private async calculateDepositByPurpose(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startYear, startMonth, endYear, endMonth, mediumName } =
      queryConditions;
    const deposits = await this.depositRepository
      .createQueryBuilder("deposit")
      .select([
        "deposit.purpose AS purpose",
        "SUM(deposit.depositAmount) AS total",
      ])
      .where("YEAR(deposit.depositDate) BETWEEN :startYear AND :endYear", {
        startYear,
        endYear,
      })
      .andWhere(
        "MONTH(deposit.depositDate) BETWEEN :startMonth AND :endMonth",
        { startMonth, endMonth }
      )
      .andWhere("deposit.isMediumMatched = true")
      .andWhere("deposit.mediumName = :mediumName", { mediumName })
      .andWhere("deposit.isDeleted = false")
      .groupBy("deposit.purpose")
      .getRawMany();

    return deposits.reduce((acc, curr) => {
      acc[curr.purpose || "Unknown"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }

  // 온라인 매체별 매출 계산
  private async calculateOnlineSales(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startYear, startMonth, endYear, endMonth, mediumName } =
      queryConditions;
    const sales = await this.onlineRepository
      .createQueryBuilder("online")
      .select([
        "online.mediumName AS mediumName",
        "SUM(online.salesAmount) AS total",
      ])
      .where("YEAR(online.salesMonth) BETWEEN :startYear AND :endYear", {
        startYear,
        endYear,
      })
      .andWhere("MONTH(online.salesMonth) BETWEEN :startMonth AND :endMonth", {
        startMonth,
        endMonth,
      })
      .andWhere("online.mediumName = :mediumName", { mediumName })
      .andWhere("online.isDeleted = false")
      .groupBy("online.mediumName")
      .getRawMany();

    return sales.reduce((acc, curr) => {
      acc[curr.mediumName || "Unknown"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }

  // 도매 매입 계산
  private async calculateWholesalePurchase(
    queryConditions: any
  ): Promise<number> {
    const { startYear, startMonth, endYear, endMonth, mediumName } =
      queryConditions;
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.purchasePrice)", "total")
      .where("YEAR(order.createdAt) BETWEEN :startYear AND :endYear", {
        startYear,
        endYear,
      })
      .andWhere("MONTH(order.createdAt) BETWEEN :startMonth AND :endMonth", {
        startMonth,
        endMonth,
      })
      .andWhere("order.isMediumMatched = true")
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .andWhere("order.isDeleted = false")
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  // 도매 매입 배송비 계산
  private async calculateWholesalePurchaseShippingFee(
    queryConditions: any
  ): Promise<number> {
    const { startYear, startMonth, endYear, endMonth, mediumName } =
      queryConditions;
    const result = await this.orderRepository
      .createQueryBuilder("order")
      .select("SUM(order.purchaseShippingFee)", "total")
      .where("YEAR(order.createdAt) BETWEEN :startYear AND :endYear", {
        startYear,
        endYear,
      })
      .andWhere("MONTH(order.createdAt) BETWEEN :startMonth AND :endMonth", {
        startMonth,
        endMonth,
      })
      .andWhere("order.isMediumMatched = true")
      .andWhere("order.mediumName = :mediumName", { mediumName })
      .andWhere("order.isDeleted = false")
      .getRawOne();

    return parseInt(result.total) || 0;
  }

  // 출금 내역 용도별로 계산
  private async calculateWithdrawalByPurpose(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startYear, startMonth, endYear, endMonth, mediumName } =
      queryConditions;
    const withdrawals = await this.withdrawalRepository
      .createQueryBuilder("withdrawal")
      .select([
        "withdrawal.purpose AS purpose",
        "SUM(withdrawal.withdrawalAmount) AS total",
      ])
      .where(
        "YEAR(withdrawal.withdrawalDate) BETWEEN :startYear AND :endYear",
        { startYear, endYear }
      )
      .andWhere(
        "MONTH(withdrawal.withdrawalDate) BETWEEN :startMonth AND :endMonth",
        { startMonth, endMonth }
      )
      .andWhere("withdrawal.isMediumMatched = true")
      .andWhere("withdrawal.mediumName = :mediumName", { mediumName })
      .andWhere("withdrawal.isDeleted = false")
      .groupBy("withdrawal.purpose")
      .getRawMany();

    return withdrawals.reduce((acc, curr) => {
      acc[curr.purpose || "Unknown"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }

  // 온라인 매입액 매체별로 계산
  private async calculateOnlinePurchase(
    queryConditions: any
  ): Promise<Record<string, number>> {
    const { startYear, startMonth, endYear, endMonth, mediumName } =
      queryConditions;
    const purchases = await this.onlineRepository
      .createQueryBuilder("online")
      .select([
        "online.mediumName AS mediumName",
        "SUM(online.purchaseAmount) AS total",
      ])
      .where("YEAR(online.salesMonth) BETWEEN :startYear AND :endYear", {
        startYear,
        endYear,
      })
      .andWhere("MONTH(online.salesMonth) BETWEEN :startMonth AND :endMonth", {
        startMonth,
        endMonth,
      })
      .andWhere("online.mediumName = :mediumName", { mediumName })
      .andWhere("online.isDeleted = false")
      .groupBy("online.mediumName")
      .getRawMany();

    return purchases.reduce((acc, curr) => {
      acc[curr.mediumName || "Unknown"] = parseInt(curr.total, 10);
      return acc;
    }, {});
  }
}
