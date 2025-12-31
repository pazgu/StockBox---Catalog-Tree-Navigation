import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class LoginDto{

    @IsString()
    @IsNotEmpty()
    username:string

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email:string
}