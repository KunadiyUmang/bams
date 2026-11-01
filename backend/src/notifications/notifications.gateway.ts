import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string; businessId?: string },
  ) {
    if (payload.userId) {
      const userRoom = `user_${payload.userId}`;
      client.join(userRoom);
      this.logger.log(`Client ${client.id} joined ${userRoom}`);
    }

    if (payload.businessId) {
      const businessRoom = `business_${payload.businessId}`;
      client.join(businessRoom);
      this.logger.log(`Client ${client.id} joined ${businessRoom}`);
    }

    return { status: 'joined', rooms: Array.from(client.rooms) };
  }

  emitToUser(userId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`user_${userId}`).emit(event, data);
    }
  }

  emitToBusiness(businessId: string, event: string, data: any) {
    if (this.server) {
      this.server.to(`business_${businessId}`).emit(event, data);
    }
  }

  emitBroadcast(event: string, data: any) {
    if (this.server) {
      this.server.emit(event, data);
    }
  }
}
