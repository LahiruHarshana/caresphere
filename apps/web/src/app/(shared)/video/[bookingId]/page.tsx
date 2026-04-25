"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { VideoCall } from "@/components/video/video-call";
import { useEffect, useState } from "react";

export default function VideoCallPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user, token, isLoading } = useAuth();
  const [otherUserId, setOtherUserId] = useState<string | null>(null);

  useEffect(() => {
    // In a real implementation, you'd fetch the booking details to determine the other user's ID
    // For this prototype, we'll assume the component somehow gets it, 
    // or VideoCall is updated to use bookingId instead of otherUserId directly
    // Let's pass a placeholder or the actual implementation logic
    setOtherUserId("other-user-placeholder"); 
  }, [bookingId]);

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
    <div className="h-screen bg-gray-900 flex items-center justify-center p-4">
      {otherUserId && (
        <VideoCall
          otherUserId={otherUserId} // VideoCall currently expects otherUserId. Ideally we'd modify VideoCall to take bookingId and currentUser.
        />
      )}
    </div>
  );
}
