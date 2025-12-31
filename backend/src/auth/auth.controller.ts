import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/Login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}
     @Post('login')
     @UsePipes(new ValidationPipe())
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}
