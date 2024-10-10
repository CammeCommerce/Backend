import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Medium } from "src/domain/medium/entity/medium.entity";
import { Repository } from "typeorm";
import { createMediumDto } from "src/domain/medium/dto/request/create-medium.dto";
import { CreateMediumResultDto } from "src/domain/medium/dto/response/create-medium-result.dto";
import { plainToInstance } from "class-transformer";

@Injectable()
export class MediumService {
  constructor(
    @InjectRepository(Medium)
    private readonly mediumRepository: Repository<Medium>
  ) {}

  // 매체명 등록
  async createMedium(dto: createMediumDto): Promise<CreateMediumResultDto> {
    const medium = this.mediumRepository.create(dto);
    await this.mediumRepository.save(medium);

    // 매체명 등록 결과 DTO 생성
    const createMediumResultDto = plainToInstance(CreateMediumResultDto, {
      id: medium.id,
      name: medium.name,
      createdAt: medium.createdAt,
    });

    return createMediumResultDto;
  }
}
