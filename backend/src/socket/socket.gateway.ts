import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/schemas/Users.schema';
import { Model } from 'mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly configService:ConfigService
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) throw new Error('No token');

      const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') });

      const user = await this.userModel
        .findById(payload.sub)
        .select('_id role approved isBlocked');

      if (!user) throw new NotFoundException('User not found');
      if (user.isBlocked) throw new ForbiddenException('User is blocked');
      if (!user.approved) throw new ForbiddenException('User not approved');

      client.data.user = {
        userId: user._id,
        role: user.role,
      };

      client.join(user._id.toString());
      client.join(user.role);

      console.log('Socket connected:', user._id);
    } catch (err) {
      console.log('Socket auth failed:', err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
}