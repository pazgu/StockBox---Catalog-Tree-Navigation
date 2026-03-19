import { useEffect, useRef, useCallback,useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketProps {
  token: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRoleChanged?: () => void;
}

interface UseSocketReturn {
  socket: Socket | null;
  isReady: boolean;
  joinRoleRoom: (role: string) => void;
  leaveRoleRoom: (role: string) => void;
  emitEvent: (event: string, data?: any) => void;
  onEvent: (event: string, callback: (...args: any[]) => void) => void;
  offEvent: (event: string, callback?: (...args: any[]) => void) => void;
}

export const useSocket = ({
  token,
  onConnect,
  onDisconnect,
  onRoleChanged,
}: UseSocketProps): UseSocketReturn => {
const socketRef = useRef<Socket | null>(null);
const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:4000', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsReady(true); 
      onConnect?.();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      onDisconnect?.();
    });
    socket.on('user_role_changed', () => {
      onRoleChanged?.();
    });

    return () => {
      setIsReady(false);
      socket.disconnect();
    };
  }, [token, onConnect, onDisconnect, onRoleChanged]);

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

  const offEvent = useCallback((event: string, callback?: (...args: any[]) => void) => {
    if (!socketRef.current) return;

    if (callback) {
      socketRef.current.off(event, callback);
    } else {
      socketRef.current.off(event);
    }
  }, []);

  return {
    socket: socketRef.current,
    isReady,
    joinRoleRoom,
    leaveRoleRoom,
    emitEvent,
    onEvent,
    offEvent,
  };
};