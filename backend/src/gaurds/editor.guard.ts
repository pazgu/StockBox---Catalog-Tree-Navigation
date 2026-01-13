import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from 'src/schemas/Users.schema';
import { RequestUser } from '../auth/strategies/jwt.strategy';

interface AuthenticatedRequest extends Request {
  user?: RequestUser;
}

@Injectable()
export class EditorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (user.role !== (UserRole.EDITOR as string)) {
      throw new ForbiddenException('Only editors can perform this action');
    }

    return true;
  }
}
