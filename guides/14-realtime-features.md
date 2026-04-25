# Guide 14 — Real-Time Features

> **Priority**: P2  
> **Estimated Time**: 4–6 hours  
> **Depends on**: Guides 01, 06

---

## 1. Video Call Feature

### Current State
- `VideoGateway` exists with WebRTC signaling (offer, answer, ICE candidate)
- `VideoCallComponent` exists as a React component
- No page route to access video calls
- No TURN/STUN configuration
- No booking-level access control

### A. Add TURN/STUN Config

Create a free Metered TURN server account at [metered.ca](https://www.metered.ca/) or use Google's free STUN server.

### B. Create Video Call Page

#### File: `apps/web/src/app/(shared)/video/[bookingId]/page.tsx` (NEW)

```tsx
"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { VideoCall } from "@/components/video/video-call";

export default function VideoCallPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <p className="text-white">Please log in to join the call.</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <VideoCall
        bookingId={bookingId}
        currentUser={user}
        token={token}
      />
    </div>
  );
}
```

### C. Update Video Call Component

The existing `VideoCall` component needs proper ICE server configuration:

```tsx
// In the component, update the RTCPeerConnection config:
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN servers for production:
    // {
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'user',
    //   credential: 'password',
    // },
  ],
});
```

### D. Backend — Validate Booking Participation

Update `VideoGateway` to verify the caller is part of the booking:

```typescript
@SubscribeMessage('join-room')
async handleJoinRoom(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { bookingId: string; userId: string },
) {
  // Verify user is part of this booking
  const booking = await this.prisma.booking.findUnique({
    where: { id: data.bookingId },
  });

  if (!booking || (booking.customerId !== data.userId && booking.caregiverId !== data.userId)) {
    client.emit('error', 'Not authorized to join this call');
    return;
  }

  if (booking.status !== 'IN_PROGRESS' && booking.status !== 'CONFIRMED') {
    client.emit('error', 'Booking is not active');
    return;
  }

  client.join(`room:${data.bookingId}`);
  client.to(`room:${data.bookingId}`).emit('user-joined', { userId: data.userId });
}
```

### E. Add "Start Video Call" Button

In the booking detail page and active gig view, add:

```tsx
<Link
  href={`/video/${booking.id}`}
  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
>
  <Video className="w-4 h-4" />
  Start Video Call
</Link>
```

---

## 2. Real-Time Chat Enhancements

### A. Message Status (Delivered/Read)

Add to the Message model:
```prisma
model Message {
  // ... existing fields
  deliveredAt DateTime?
  readAt      DateTime?
}
```

### B. Typing Indicators

In `ChatGateway`:
```typescript
@SubscribeMessage('typing')
handleTyping(
  @ConnectedSocket() client: Socket,
  @MessageBody() data: { receiverId: string; isTyping: boolean },
) {
  this.server
    .to(`user:${data.receiverId}`)
    .emit('typing', { senderId: client.data.userId, isTyping: data.isTyping });
}
```

In the chat window component:
```tsx
const [isOtherTyping, setIsOtherTyping] = useState(false);

socket.on("typing", (data) => {
  if (data.senderId === otherUser.id) {
    setIsOtherTyping(data.isTyping);
  }
});

// Show typing indicator:
{isOtherTyping && (
  <div className="text-sm text-gray-400 italic px-4 py-2">
    {otherUser.firstName} is typing...
  </div>
)}
```

### C. Online Status

Track connected users:

```typescript
// In ChatGateway:
private connectedUsers = new Map<string, string>(); // userId -> socketId

handleConnection(client: Socket) {
  const userId = client.data.userId;
  this.connectedUsers.set(userId, client.id);
  this.server.emit('user-online', userId);
}

handleDisconnect(client: Socket) {
  const userId = client.data.userId;
  this.connectedUsers.delete(userId);
  this.server.emit('user-offline', userId);
}

@SubscribeMessage('check-online')
handleCheckOnline(@MessageBody() data: { userId: string }) {
  return this.connectedUsers.has(data.userId);
}
```

---

## 3. Real-Time Booking Notifications

### Live Booking Status Updates

When a booking status changes, push the update to connected clients:

```typescript
// In bookings.service.ts, after updating status:
this.notificationsGateway.server
  .to(`user:${notifyUserId}`)
  .emit('booking-update', {
    bookingId,
    newStatus,
    timestamp: new Date(),
  });
```

### Frontend — Listen for Updates

```tsx
// In booking pages:
useEffect(() => {
  if (!socket) return;

  socket.on('booking-update', (data: { bookingId: string; newStatus: string }) => {
    // Update local state if it's a booking we're displaying
    setBookings(prev =>
      prev.map(b =>
        b.id === data.bookingId ? { ...b, status: data.newStatus } : b
      )
    );
  });

  return () => { socket.off('booking-update'); };
}, [socket]);
```

---

## 4. Custom React Hook for WebSocket

### File: `apps/web/src/hooks/use-socket.ts` (NEW)

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function useSocket(namespace: string, token: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io(`${API_URL}/${namespace}`, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [namespace, token]);

  return { socket: socketRef.current, isConnected };
}
```

---

## 5. Verification Checklist

- [ ] Video call page loads and accesses camera/microphone
- [ ] WebRTC connection establishes between two users
- [ ] Booking validation prevents unauthorized callers
- [ ] Typing indicator shows when the other user is typing
- [ ] Online status dot shows green for connected users
- [ ] Message read/delivered status updates in real-time
- [ ] Booking status changes push to the frontend without refresh
- [ ] Socket reconnects automatically after disconnection
