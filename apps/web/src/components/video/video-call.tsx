'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';

interface VideoCallProps {
  bookingId: string;
  token: string;
  isInitiator: boolean;
}

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

export const VideoCall: React.FC<VideoCallProps> = ({ bookingId, token, isInitiator }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socket = useSocket('video', token);

  useEffect(() => {
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Failed to get media devices', err);
      }
    };
    initMedia();
  }, []);

  useEffect(() => {
    if (!socket || !localStream) return;

    pcRef.current = new RTCPeerConnection(configuration);

    localStream.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, localStream);
    });

    pcRef.current.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
    };

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { candidate: event.candidate, bookingId });
      }
    };

    socket.emit('join-room', { bookingId });

    socket.on('offer', async (offer) => {
      if (!isInitiator) {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current?.createAnswer();
        await pcRef.current?.setLocalDescription(answer);
        socket.emit('answer', { answer, bookingId });
      }
    });

    socket.on('answer', async (answer) => {
      if (isInitiator) {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socket.on('ice-candidate', async (candidate) => {
      await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('call-ended', () => {
      endCall();
    });

    if (isInitiator) {
      const startCall = async () => {
        const offer = await pcRef.current?.createOffer();
        await pcRef.current?.setLocalDescription(offer);
        socket.emit('offer', { offer, bookingId });
      };
      startCall();
    }

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('call-ended');
    };
  }, [socket, localStream, bookingId, isInitiator]);

  const endCall = () => {
    localStream?.getTracks().forEach(track => track.stop());
    pcRef.current?.close();
    setCallEnded(true);
    socket?.emit('end-call', { bookingId });
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  if (callEnded) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-gray-900 text-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Call Ended</h2>
        <button onClick={() => window.location.reload()} className="bg-teal-600 px-6 py-2 rounded-lg">Close</button>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full bg-black rounded-lg overflow-hidden group">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-1/4 aspect-video object-cover rounded-lg border-2 border-teal-500 shadow-xl"
      />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-900/50 p-4 rounded-full backdrop-blur-md">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:scale-110 transition-transform`}
        >
          {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} hover:scale-110 transition-transform`}
        >
          {isVideoOff ? <VideoOff className="text-white" /> : <Video className="text-white" />}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 hover:scale-110 transition-all shadow-lg"
        >
          <PhoneOff className="text-white" />
        </button>
      </div>
    </div>
  );
};
