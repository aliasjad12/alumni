import React, { useEffect, useState, useRef } from "react";
import socket from "../utils/socket";
import axios from "axios";

const CallScreen = ({
  callType,
  localStreamRef,
  remoteStreamRef,
  localVideoRef,
  remoteVideoRef,
  localAudioRef,
  remoteAudioRef,
  endCall,
  selectedUser,
  isCalling,
  callAccepted,
}) => {
  return (
    <div
      className="call-screen"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: callType === "video" ? "#000" : "#222",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <h2 style={{ marginBottom: 10 }}>
        {callType === "video" ? "Video Call" : "Audio Call"} with{" "}
        {selectedUser?.name}
      </h2>

      {callType === "video" && (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "80%",
      maxWidth: 800,
    }}
  >
    {/* Show remote video only if call is accepted */}
    {callAccepted && (
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{
          width: "70%",
          borderRadius: 12,
          backgroundColor: "black",
          marginRight: 10,
        }}
      />
    )}

    {/* Always show local video for self-preview */}
    <video
      ref={localVideoRef}
      autoPlay
      muted
      playsInline
      style={{
        width: callAccepted ? "30%" : "100%",
        borderRadius: 12,
        backgroundColor: "black",
        border: "2px solid #0f0",
      }}
    />
  </div>
)}


      {callType === "audio" && callAccepted && (
        <>
          <audio ref={remoteAudioRef} autoPlay playsInline />
          <audio ref={localAudioRef} autoPlay muted playsInline />
          <div
            style={{
              fontSize: 32,
              marginTop: 40,
              padding: 20,
              border: "2px solid #0f0",
              borderRadius: 50,
              width: 100,
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            🎤
          </div>
          <p style={{ marginTop: 20 }}>Audio call in progress...</p>
        </>
      )}

      <button
        onClick={endCall}
        style={{
          marginTop: 40,
          backgroundColor: "red",
          border: "none",
          borderRadius: 10,
          padding: "12px 24px",
          color: "#fff",
          fontSize: 18,
          cursor: "pointer",
        }}
      >
        End Call
      </button>
    </div>
  );
};

const Chatbox = ({ currentUser }) => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  // WebRTC state
  const [incomingCall, setIncomingCall] = useState(null); // { from, signal }
  const [callAccepted, setCallAccepted] = useState(false);
  const [callRejected, setCallRejected] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callType, setCallType] = useState(null); // "video" or "audio"

  // Media streams refs
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  // Media elements refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const peerConnectionRef = useRef(null);

  const servers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      // Add TURN servers here if you have any
    ],
  };

  // Fetch users (alumni or students)
  useEffect(() => {
    socket.emit("join_room", currentUser._id);

    const fetchUsers = async () => {
      let res;
      if (currentUser.role === "alumni") {
        res = await axios.get("http://localhost:5000/api/users/students");
      } else {
        res = await axios.get("http://localhost:5000/api/users/alumni");
      }
      setUsers(res.data);
    };

    fetchUsers();
  }, [currentUser]);

  // Listen for incoming messages and signaling events
  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (data.senderId === selectedUser?._id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on("incoming_call", ({ from, signal, callType }) => {
      setIncomingCall({ from, signal });
      setCallType(callType);
      setCallRejected(false);
      setCallEnded(false);
    });

    socket.on("call_accepted", async ({ signal }) => {
      setCallAccepted(true);

      // Only set remote description if peerConnection exists and in correct state
      if (
        peerConnectionRef.current &&
        peerConnectionRef.current.signalingState === "have-local-offer"
      ) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(signal)
          );
        } catch (error) {
          console.error(
            "Error setting remote description on caller:",
            error
          );
        }
      } else {
        console.warn(
          "PeerConnection not in 'have-local-offer' state or doesn't exist when setting remote description."
        );
      }
    });

    socket.on("call_rejected", () => {
      alert("Call rejected by user.");
      cleanupCall();
    });

    socket.on("call_ended", () => {
      alert("Call ended.");
      cleanupCall();
    });

    socket.on("ice_candidate", async ({ candidate }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        }
      } catch (err) {
        console.error("Error adding received ice candidate", err);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("incoming_call");
      socket.off("call_accepted");
      socket.off("call_rejected");
      socket.off("call_ended");
      socket.off("ice_candidate");
    };
  }, [selectedUser]);

  // Select user to chat
  const selectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    setCallEnded(false);
    setCallAccepted(false);
    setIncomingCall(null);
    setCallRejected(false);

    const res = await axios.get(
      `http://localhost:5000/api/chat/messages/${currentUser._id}/${user._id}`
    );
    setMessages(res.data);
  };

  // Send chat message
  const sendMessage = () => {
    if (!messageText) return;

    const messageData = {
      senderId: currentUser._id,
      receiverId: selectedUser._id,
      message: messageText,
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setMessageText("");

    axios.post("http://localhost:5000/api/chat/send", messageData);
  };

  // Cleanup call state and streams
  const cleanupCall = () => {
    setIsCalling(false);
    setCallAccepted(false);
    setIncomingCall(null);
    setCallRejected(false);
    setCallEnded(true);
    setCallType(null);

    // Close streams
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  // Start a call (audio or video)
 const callUser = async (type) => {
  if (!selectedUser) {
    alert("Select a user first");
    return;
  }

  setCallType(type);
  setIsCalling(true);
  setCallEnded(false);

  // Get user media
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: type === "video",
      audio: true,
    });
    localStreamRef.current = stream;

    // ✅ Caller sees themselves (SELF PREVIEW)
    if (type === "video" && localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    } else if (type === "audio" && localAudioRef.current) {
      localAudioRef.current.srcObject = stream;
    }
  } catch (err) {
    alert("Could not access media devices.");
    setIsCalling(false);
    return;
  }

  // Create peer connection
  peerConnectionRef.current = new RTCPeerConnection(servers);

  // Add local tracks
  stream.getTracks().forEach((track) => {
    peerConnectionRef.current.addTrack(track, stream);
  });

  // Create remote stream container
  remoteStreamRef.current = new MediaStream();

  // Set remote stream tracks
  peerConnectionRef.current.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStreamRef.current.addTrack(track);
    });

    // ✅ Set remote stream to video/audio tag
    if (type === "video" && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    } else if (type === "audio" && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
    }
  };

  // ICE candidates handler
  peerConnectionRef.current.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("ice_candidate", {
        to: selectedUser._id,
        candidate: event.candidate,
      });
    }
  };

  // Create and send offer
  try {
    const offer = await peerConnectionRef.current.createOffer();
    await peerConnectionRef.current.setLocalDescription(offer);

    socket.emit("call_user", {
      userToCall: selectedUser._id,
      from: currentUser._id,
      signal: offer,
      callType: type,
    });
  } catch (err) {
    console.error("Error creating offer:", err);
    cleanupCall();
  }
};


  // Accept incoming call
  const acceptCall = async () => {
    setCallAccepted(true);
    setCallRejected(false);
    setCallEnded(false);

    // Get user media matching call type
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      localStreamRef.current = stream;
    } catch (err) {
      alert("Could not access media devices.");
      return;
    }

    // Create peer connection
    peerConnectionRef.current = new RTCPeerConnection(servers);

    // Add local tracks
    stream.getTracks().forEach((track) => {
      peerConnectionRef.current.addTrack(track, stream);
    });

    // Create remote stream container
    remoteStreamRef.current = new MediaStream();

    // Set remote stream tracks
    peerConnectionRef.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStreamRef.current.addTrack(track);
      });
    };

    // Assign streams to video/audio elements
    if (callType === "video") {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    } else {
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = localStreamRef.current;
      }
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
      }
    }

    // ICE candidates handler
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice_candidate", {
          to: incomingCall.from,
          candidate: event.candidate,
        });
      }
    };

    try {
      // Set remote description with caller's offer
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(incomingCall.signal)
      );

      // Create answer and set local description
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);

      // Send answer back to caller
      socket.emit("accept_call", {
        to: incomingCall.from,
        signal: answer,
      });

      setIsCalling(true);
    } catch (err) {
      console.error("Error accepting call:", err);
      cleanupCall();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    socket.emit("reject_call", { to: incomingCall.from });
    setCallRejected(true);
    setIncomingCall(null);
    cleanupCall();
  };

  // End ongoing call
  const endCall = () => {
    socket.emit("end_call", { to: selectedUser._id });
    cleanupCall();
  };

  return (
    <div className="chatbox-container" style={{ display: "flex", height: "100vh" }}>
      {/* Left panel: User list */}
      <div
        style={{
          flexBasis: "25%",
          borderRight: "1px solid #ccc",
          overflowY: "auto",
          padding: 10,
        }}
      >
        <input
          type="text"
          placeholder="Search users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />
        {users
          .filter((user) =>
            user.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((user) => (
            <div
              key={user._id}
              onClick={() => selectUser(user)}
              style={{
                padding: 10,
                cursor: "pointer",
                backgroundColor:
                  selectedUser?._id === user._id ? "#ddd" : "transparent",
              }}
            >
              {user.name} ({user.role})
            </div>
          ))}
      </div>

      {/* Right panel: Chat and calls */}
      <div
        style={{
          flexBasis: "75%",
          display: "flex",
          flexDirection: "column",
          padding: 10,
        }}
      >
        {/* Chat header */}
        <div
          style={{
            borderBottom: "1px solid #ccc",
            paddingBottom: 10,
            marginBottom: 10,
            fontWeight: "bold",
          }}
        >
          {selectedUser ? `Chatting with ${selectedUser.name}` : "Select a user"}
        </div>

        {/* Messages */}
        <div
          style={{
            flexGrow: 1,
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                textAlign: msg.senderId === currentUser._id ? "right" : "left",
                marginBottom: 5,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  backgroundColor:
                    msg.senderId === currentUser._id ? "#cef" : "#eee",
                  padding: "6px 10px",
                  borderRadius: 12,
                  maxWidth: "70%",
                  wordBreak: "break-word",
                }}
              >
                {msg.message}
              </span>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="Type your message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            style={{ flexGrow: 1, padding: 8 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={!selectedUser}
          />
          <button onClick={sendMessage} disabled={!selectedUser || !messageText}>
            Send
          </button>
        </div>

        {/* Call buttons */}
        {selectedUser && !isCalling && !callAccepted && (
          <div style={{ marginTop: 10 }}>
            <button onClick={() => callUser("audio")}>Audio Call</button>
            <button onClick={() => callUser("video")} style={{ marginLeft: 10 }}>
              Video Call
            </button>
          </div>
        )}

        {/* Incoming call UI */}
        {incomingCall && !callAccepted && !callRejected && (
          <div
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              padding: 20,
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              zIndex: 1001,
            }}
          >
            <p>{selectedUser?.name || "Someone"} is calling you...</p>
            <button onClick={acceptCall} style={{ marginRight: 10 }}>
              Accept
            </button>
            <button onClick={rejectCall}>Reject</button>
          </div>
        )}

        {/* Call screen */}
        {(isCalling || callAccepted) && (
          <CallScreen
            callType={callType}
            localStreamRef={localStreamRef}
            remoteStreamRef={remoteStreamRef}
            localVideoRef={localVideoRef}
            remoteVideoRef={remoteVideoRef}
            localAudioRef={localAudioRef}
            remoteAudioRef={remoteAudioRef}
            endCall={endCall}
            selectedUser={selectedUser}
            isCalling={isCalling}
            callAccepted={callAccepted}
          />
        )}
      </div>
    </div>
  );
};

export default Chatbox;
