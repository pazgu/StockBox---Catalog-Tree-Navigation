import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';

@Injectable()
export class SocketService {
  constructor(private readonly gateway: SocketGateway) {}

  emitToAll(event: string, data?: any) {
    this.gateway.server.emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.gateway.server.to(userId).emit(event, data);
  }

  emitToRole(role: string, event: string, data?: any) {
    this.gateway.server.to(role).emit(event, data);
  }

  emitToGroup(groupId: string, event: string, data?: any) {
    this.gateway.server.to(groupId).emit(event, data);
  }

  emitToUsers(userIds: string[], event: string, data?: any) {
    const uniqueUserIds = [...new Set(userIds)];

    this.gateway.server.to(uniqueUserIds).emit(event, data);
  }
}
