import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = (namespace: string, token: string | null) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/${namespace}`, {
      auth: {
        token,
      },
    });

    socketRef.current.on('connect', () => {
      console.log(`Connected to ${namespace}`);
    });

    socketRef.current.on('connect_error', (err) => {
      console.error(`Connection error for ${namespace}:`, err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [namespace, token]);

  return socketRef.current;
};
