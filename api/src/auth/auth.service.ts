import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserModel } from './models/user-model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthAccessRequest } from './models/auth-access-request';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {
    
  }

  public getToken = async (payload: UserModel): Promise<string> => {
    return await this.jwtService.signAsync({ id: payload.id, email: payload.email })
  }

  public getHash = async (userPassword: string): Promise<string> => {
    const saltRounds = 10;
    const hash = await bcrypt.hash(userPassword, saltRounds);
    return hash
  }

  public checkUser = async (request: AuthAccessRequest, userModel: UserModel): Promise<boolean> => {
    const passwordMatch = await bcrypt.compare(request.passwordHash, userModel.passwordHash)
    const emailMatch = request.email === userModel.email
    if(passwordMatch && emailMatch) {
      return true
    }
    throw new UnauthorizedException('Error to login.')
  }
}