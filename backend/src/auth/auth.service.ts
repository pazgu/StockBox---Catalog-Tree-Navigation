import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dtos/Login.dto';
import { User, UserRole } from 'src/schemas/Users.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userModel
      .findOne({
        email: dto.email,
        userName: dto.userName,
      })
      .select('_id role approved requestSent');

    if (!user) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const newUser = await this.usersService.createUserFromLogin({
        email: dto.email,
        userName: dto.userName,
        firstName: 'xxx',
        lastName: 'xxx',
        role: UserRole.VIEWER,
        approved: false,
        requestSent: false,
        isBlocked: false,
      });

      throw new ForbiddenException({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        code: 'USER_CREATED_NOT_APPROVED',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        userId: newUser._id,
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

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });
    return {
      accessToken,
      user: {
        id: user._id,
        role: user.role,
      },
    };
  }

  async renewToken(userId: string, role: string): Promise<string> {
    const payload = {
      sub: userId,
      role,
    };
    const newToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    return newToken;
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
