'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/lib/auth-context';

interface VideoCallProps {
  otherUserId: string;
}

export const VideoCall: React.FC<VideoCallProps> = ({ otherUserId }) => {
  const { token } = useAuth();
  const { socket } = useSocket('video', token);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callActive, setCallActive] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<RTCSessionDescriptionInit | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('offer', async (data: { offer: RTCSessionDescriptionInit, from: string }) => {
      if (data.from === otherUserId) {
        setIncomingOffer(data.offer);
      }
    });

    socket.on('answer', async (data: { answer: RTCSessionDescriptionInit, from: string }) => {
      if (data.from === otherUserId && pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('ice-candidate', async (data: { candidate: RTCIceCandidateInit, from: string }) => {
      if (data.from === otherUserId && pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (e) {
          console.error('Error adding ice candidate', e);
        }
      }
    });

    return () => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket, otherUserId]);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  };

  const createPeerConnection = (stream: MediaStream) => {
    const pc = new RTCPeerConnection(configuration);
    
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', {
          candidate: event.candidate,
          to: otherUserId,
        });
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const initiateCall = async () => {
    const stream = await startLocalStream();
    if (!stream || !socket) return;

    const pc = createPeerConnection(stream);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit('offer', {
      offer,
      to: otherUserId,
    });
    setCallActive(true);
  };

  const answerCall = async () => {
    const stream = await startLocalStream();
    if (!stream || !socket || !incomingOffer) return;

    const pc = createPeerConnection(stream);
    await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));
    
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit('answer', {
      answer,
      to: otherUserId,
    });
    setCallActive(true);
    setIncomingOffer(null);
  };

  const endCall = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallActive(false);
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 p-6 rounded-xl shadow-2xl max-w-4xl w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video border-2 border-teal-700">
          <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">You</div>
        </div>
        <div className="relative bg-black rounded-lg overflow-hidden aspect-video border-2 border-amber-500">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">Remote User</div>
          {!remoteStream && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">
              {callActive ? 'Waiting for remote stream...' : 'Call not started'}
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        {!callActive && !incomingOffer && (
          <button
            onClick={initiateCall}
            className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-full font-semibold transition-colors"
          >
            Start Video Call
          </button>
        )}

        {incomingOffer && !callActive && (
          <div className="flex flex-col items-center space-y-2">
            <p className="text-white">Incoming call...</p>
            <div className="flex space-x-2">
              <button
                onClick={answerCall}
                className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2 rounded-full font-semibold transition-colors"
              >
                Answer
              </button>
              <button
                onClick={() => setIncomingOffer(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition-colors"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {callActive && (
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold transition-colors"
          >
            End Call
          </button>
        )}
      </div>
    </div>
  );
};
