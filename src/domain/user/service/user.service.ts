import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/domain/user/entity/user.entity";
import { Repository } from "typeorm";
import { UserLoginDto } from "src/domain/user/dto/request/user-login.dto";
import { plainToInstance } from "class-transformer";
import { UserLoginResultDto } from "src/domain/user/dto/response/user-login-result.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // 유저 로그인
  async loginUser(dto: UserLoginDto): Promise<UserLoginResultDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email, password: dto.password },
    });

    if (!user) {
      throw new NotFoundException("관리자를 찾을 수 없습니다.");
    }

    return plainToInstance(UserLoginResultDto, {
      id: user.id,
      message: "로그인에 성공했습니다.",
    });
  }
}
