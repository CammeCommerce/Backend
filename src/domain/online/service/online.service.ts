import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Online } from "src/domain/online/entity/online.entity";
import { Repository } from "typeorm";
import { plainToInstance } from "class-transformer";
import { CreateOnlineDto } from "src/domain/online/dto/request/create-online.dto";
import { CreateOnlineResultDto } from "src/domain/online/dto/response/create-online.result.dto";

@Injectable()
export class OnlineService {
  constructor(
    @InjectRepository(Online)
    private readonly onlineRepository: Repository<Online>
  ) {}

  // 온라인(행) 등록
  async createOnline(dto: CreateOnlineDto): Promise<CreateOnlineResultDto> {
    const online = await this.onlineRepository.create(dto);
    await this.onlineRepository.save(online);

    // 온라인(행) 등록 결과 DTO 생성
    const createOnlineResultDto = plainToInstance(CreateOnlineResultDto, {
      id: online.id,
      salesMonth: online.salesMonth,
      mediumName: online.mediumName,
      onlineCompanyName: online.onlineCompanyName,
      salesAmount: online.salesAmount,
      purchaseAmount: online.purchaseAmount,
      marginAmount: online.marginAmount,
      memo: online.memo,
    });

    return createOnlineResultDto;
  }
}
