import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto{

    @IsString()
    @IsNotEmpty()
    userName:string

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
