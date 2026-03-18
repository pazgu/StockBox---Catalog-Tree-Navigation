import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  token: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  joinRoleRoom: (role: string) => void;
  leaveRoleRoom: (role: string) => void;
  emitEvent: (event: string, data?: any) => void;
  onEvent: (event: string, callback: (...args: any[]) => void) => void;
}

export const useSocket = ({ token, onConnect, onDisconnect }: UseSocketProps): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:4000', {
      auth: { token }, 
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      onDisconnect?.();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, onConnect, onDisconnect]);

  const joinRoleRoom = useCallback((role: string) => {
    socketRef.current?.emit('join_role_room', role);
  }, []);

  const leaveRoleRoom = useCallback((role: string) => {
    socketRef.current?.emit('leave_role_room', role);
  }, []);

  const emitEvent = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const onEvent = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
  }, []);

  return {
    socket: socketRef.current,
    joinRoleRoom,
    leaveRoleRoom,
    emitEvent,
    onEvent,
  };
};