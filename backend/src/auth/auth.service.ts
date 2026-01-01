import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/Login.dto';
import { User } from 'src/schemas/Users.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({
      email: dto.email,
      userName: dto.userName,
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.approved) {
      if (!user.requestSent) {
        throw new ForbiddenException({
          code: 'USER_NOT_APPROVED_REQUEST_NOT_SENT',
        });
      }

      throw new ForbiddenException({
        code: 'USER_NOT_APPROVED_REQUEST_SENT',
      });
    }

    const payload = {
      sub: user._id,
      role: user.role,
    };

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      accessToken: this.jwtService.sign(payload),
    };
  }
}
