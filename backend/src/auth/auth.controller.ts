import {
  Body,
  Controller,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/Login.dto';
import { UpdateRequestDto } from './dtos/UpdateRequest.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Patch('request-sent')
  @UsePipes(new ValidationPipe())
  async markRequestSent(@Body() dto: UpdateRequestDto) {
    return this.authService.markRequestSent(dto.userId);
  }
}
