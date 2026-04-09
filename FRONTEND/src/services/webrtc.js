// let peerConnection = null;
// let localStream = null;
// let pendingCandidates = [];

// const config = {
//   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
// };

// export const startLocalStream = async (videoRef) => {
//   const stream = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true,
//   });

//   localStream = stream;
//   videoRef.current.srcObject = stream;
//   videoRef.current.muted = true;
//   await videoRef.current.play();
// };

// export const createPeerConnection = (socket, chatId, remoteVideoRef) => {
//   peerConnection = new RTCPeerConnection(config);

//   localStream.getTracks().forEach((track) =>
//     peerConnection.addTrack(track, localStream)
//   );

//   peerConnection.ontrack = (event) => {
//     remoteVideoRef.current.srcObject = event.streams[0];
//     remoteVideoRef.current.play();
//   };

//   peerConnection.onicecandidate = (event) => {
//     if (event.candidate) {
//       socket.emit("iceCandidate", { chatId, candidate: event.candidate });
//     }
//   };

//   pendingCandidates.forEach((c) => peerConnection.addIceCandidate(c));
//   pendingCandidates = [];
// };

// export const createOffer = async (socket, chatId) => {
//   const offer = await peerConnection.createOffer();
//   await peerConnection.setLocalDescription(offer);
//   socket.emit("webrtcOffer", { chatId, offer });
// };

// export const handleOffer = async (socket, chatId, offer) => {
//   await peerConnection.setRemoteDescription(offer);
//   const answer = await peerConnection.createAnswer();
//   await peerConnection.setLocalDescription(answer);
//   socket.emit("webrtcAnswer", { chatId, answer });
// };

// export const handleAnswer = async (answer) => {
//   await peerConnection.setRemoteDescription(answer);
// };

// export const addIceCandidate = async (candidate) => {
//   if (!peerConnection || !peerConnection.remoteDescription) {
//     pendingCandidates.push(candidate);
//   } else {
//     await peerConnection.addIceCandidate(candidate);
//   }
// };

// export const endCall = () => {
//   peerConnection?.close();
//   peerConnection = null;
//   localStream?.getTracks().forEach((t) => t.stop());
//   localStream = null;
// };



let peerConnection = null;
let localStream = null;
let pendingCandidates = [];

const config = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

export const startLocalStream = async (videoRef) => {
  if (localStream) return localStream;

  try {
    // First check if we have permissions
    const permissions = await navigator.permissions.query({ name: 'microphone' });
    const cameraPermissions = await navigator.permissions.query({ name: 'camera' });

    console.log("🎥 Media permissions - Mic:", permissions.state, "Camera:", cameraPermissions.state);

    // Request media access
    localStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
    });

    if (videoRef.current) {
      videoRef.current.srcObject = localStream;
      videoRef.current.muted = true;
      await videoRef.current.play();
    }

    return localStream;
  } catch (error) {
    console.error("Error accessing media devices:", error);

    // Provide more specific error messages
    let errorMessage = "Unable to access camera/microphone. ";

    switch (error.name) {
      case 'NotReadableError':
        errorMessage += "The camera or microphone is already in use by another application. Please close other applications that might be using your camera/microphone and try again.";
        break;
      case 'NotAllowedError':
        errorMessage += "Camera/microphone access was denied. Please allow access in your browser settings and refresh the page.";
        break;
      case 'NotFoundError':
        errorMessage += "No camera or microphone found. Please connect a camera/microphone and try again.";
        break;
      case 'OverconstrainedError':
        errorMessage += "The requested camera/microphone settings are not supported.";
        break;
      case 'SecurityError':
        errorMessage += "Camera/microphone access is not allowed due to security restrictions. Please use HTTPS.";
        break;
      default:
        errorMessage += "Please check your camera/microphone permissions and try again.";
    }

    // Create a custom error with the user-friendly message
    const customError = new Error(errorMessage);
    customError.originalError = error;
    throw customError;
  }
};

export const createPeerConnection = async (socket, chatId, remoteVideoRef) => {
  if (peerConnection && peerConnection.connectionState !== 'closed') return peerConnection;
  if (!localStream) throw new Error("Local stream not started");

  peerConnection = new RTCPeerConnection(config);

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  peerConnection.ontrack = (event) => {
    console.log("🎥 Remote stream received");
    remoteVideoRef.current.srcObject = event.streams[0];
    remoteVideoRef.current.play().catch(console.error);
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("iceCandidate", { chatId, candidate: event.candidate });
    }
  };

  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE state:", peerConnection.iceConnectionState);
  };

  pendingCandidates.forEach((c) =>
    peerConnection.addIceCandidate(new RTCIceCandidate(c))
  );
  pendingCandidates = [];

  return peerConnection;
};

export const createOffer = async (socket, chatId) => {
  if (!peerConnection) {
    console.error("Peer connection not initialized");
    return;
  }
  console.log("📞 Creating WebRTC offer for chat:", chatId);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  console.log("📤 Sending offer:", offer);
  socket.emit("webrtcOffer", { chatId, offer });
};

export const handleOffer = async (socket, chatId, offer) => {
  if (!peerConnection) {
    console.error("Peer connection not initialized");
    return;
  }
  console.log("📨 Handling WebRTC offer for chat:", chatId);
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offer)
  );
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  console.log("📤 Sending answer:", answer);
  socket.emit("webrtcAnswer", { chatId, answer });
};

export const handleAnswer = async (answer) => {
  if (!peerConnection) {
    console.error("Peer connection not initialized");
    return;
  }
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(answer)
  );
};

export const addIceCandidate = async (candidate) => {
  if (!peerConnection) {
    console.error("Peer connection not initialized");
    pendingCandidates.push(candidate);
    return;
  }
  if (!peerConnection.remoteDescription) {
    pendingCandidates.push(candidate);
    return;
  }
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
};

export const endCall = () => {
  peerConnection?.close();
  peerConnection = null;

  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;

  pendingCandidates = [];
};
