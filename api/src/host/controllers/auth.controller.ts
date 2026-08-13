import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('me')
  me(@Req() request: Request): { email: string } {
    const user = (request as any).user as { email: string } | undefined;
    return { email: user?.email ?? '' };
  }
}
