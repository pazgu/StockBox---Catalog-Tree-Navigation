import {
  ForbiddenException,
  Injectable,
  NotFoundException,
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
    const user = await this.userModel
      .findOne({
        email: dto.email,
        userName: dto.userName,
      })
      .select('_id role approved requestSent');

    if (!user) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
      });
    }

    if (!user.approved) {
      if (!user.requestSent) {
        throw new ForbiddenException({
          code: 'USER_NOT_APPROVED_REQUEST_NOT_SENT',
          userId: user._id, 
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
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user._id,
        role: user.role,
      },
    };
  }

  async markRequestSent(userId: string) {
  const user = await this.userModel.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  if (user.requestSent) {
    return { message: 'Request already sent' };
  }

  user.requestSent = true;
  await user.save();
  return { message: 'Request marked as sent' };
}
}
