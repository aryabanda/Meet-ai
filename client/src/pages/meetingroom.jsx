import {
  useEffect,
  useState,
  useRef
} from "react";

import {
  useParams
} from "react-router-dom";

import socket from "../services/socket";
import api from "../services/api";

const configuration = {
  iceServers: [
    {
      urls:
        "stun:stun.l.google.com:19302"
    }
  ]
};

function MeetingRoom() {

  const { meetingId } =
    useParams();

  const username =
    localStorage.getItem(
      "username"
    );

  const [
    participants,
    setParticipants
  ] = useState([]);

  const [meetingStarted, setMeetingStarted] =
  useState(false);

const [isHost, setIsHost] =
  useState(false);


  const localVideoRef =
  useRef(null);

const remoteVideoRef =
  useRef(null);

const peerConnectionRef =
  useRef(null);

const localStreamRef =
  useRef(null);



    const createPeerConnection =
  (targetSocketId) => {

    const pc =
      new RTCPeerConnection(
        configuration
      );

    peerConnectionRef.current =
      pc;

    localStreamRef.current
      ?.getTracks()
      .forEach(track => {

        pc.addTrack(
          track,
          localStreamRef.current
        );

      });

    pc.ontrack =
      (event) => {

        if (
          remoteVideoRef.current
        ) {

          remoteVideoRef.current.srcObject =
            event.streams[0];

        }

      };

    pc.onicecandidate =
      (event) => {

        if (
          event.candidate
        ) {

          socket.emit(
            "ice-candidate",
            {
              candidate:
                event.candidate,
              target:
                targetSocketId
            }
          );

        }

      };

    return pc;

  };

  const startMeeting = async () => {

  console.log("START MEETING CLICKED");

  await api.post(
    `/meetings/${meetingId}/start`,
    {},
    {
      headers: {
        Authorization:
          `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  console.log("API SUCCESS");

  socket.emit(
  "start-meeting",
  meetingId
);

setMeetingStarted(true);

// auto start call
const target =
  participants.find(
    p =>
      p.socketId !== socket.id
  );

if (!target) {
  console.log(
    "No participant found"
  );
  return;
}
if (target) {

  const pc =
  createPeerConnection(
    target.socketId
  );

  const offer =
    await pc.createOffer();

  await pc.setLocalDescription(
    offer
  );

  socket.emit(
    "offer",
    {
      offer,
      target: target.socketId
    }
  );

  socket.emit(
    "call-started",
    meetingId
  );


}
};


  useEffect(() => {

    const loadMeeting =
  async () => {

    try {

      const res =
        await api.get(
          `/meetings/${meetingId}`,
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

      setMeetingStarted(
        res.data.isStarted
      );

    } catch (error) {

      console.error(
        "Meeting fetch error:",
        error
      );

    }

  };

    const startCamera =
      async () => {

        try {

          const stream =
            await navigator
              .mediaDevices
              .getUserMedia({
                video: true,
                audio: true
              });
            localStreamRef.current = stream;
            console.log(localVideoRef.current);

          if (
              localVideoRef.current
            ) {

              localVideoRef.current.srcObject =
                stream;
              console.log(
    "LOCAL VIDEO ATTACHED"
  );

            }

        } catch (error) {

          console.error(
            "Camera Error:",
            error
          );

        }

      };
    loadMeeting();
    startCamera();

    socket.emit(
  "join-room",
  {
    meetingId,
    username,
    userId: localStorage.getItem("userId")
    
  }
  

);

socket.on(
  "meeting-started",
  () => {

    setMeetingStarted(
      true
    );

  }
);



    socket.on(
      "participants-update",
      (
        participantsList
      ) => {

        setParticipants(
          participantsList
        );
        
        const host = participantsList[0];

      setIsHost(
        host?.username === username
      );

      }
    );

    socket.on(
  "offer",
  async ({
    offer,
    sender
  }) => {

    const pc =
      createPeerConnection(
        sender
      );

    await pc.setRemoteDescription(
      offer
    );

    const answer =
      await pc.createAnswer();

    await pc.setLocalDescription(
      answer
    );

    socket.emit(
      "answer",
      {
        answer,
        target:
          sender
      }
    );

  }
);

socket.on(
  "answer",
  async ({
    answer
  }) => {

    await peerConnectionRef
      .current
      ?.setRemoteDescription(
        answer
      );

  }
);

socket.on(
  "ice-candidate",
  async ({
    candidate
  }) => {

    try {

      await peerConnectionRef
        .current
        ?.addIceCandidate(
          candidate
        );

    } catch (error) {

      console.error(
        error
      );

    }

  }
);


    return () => {

  

  socket.off(
    "participants-update"
  );
socket.off(
  "call-started"
);
  socket.off(
    "offer"
  );

  socket.off(
    "answer"
  );

  socket.off(
    "ice-candidate"
  );
  socket.off(
  "meeting-started"
);

};

  }, [
    meetingId,
    username
  ]);

  useEffect(() => {

  if (
    localVideoRef.current &&
    localStreamRef.current
  ) {

    localVideoRef.current.srcObject =
      localStreamRef.current;

  }

}, [meetingStarted]);

  if (
  !meetingStarted &&
  isHost
) {

  return (
    <div>

      <h1>
        Meeting Lobby
      </h1>

      <h2>
        Participants
      </h2>

      {participants.map(
        user => (
          <p key={user.userId}>
            {user.username}
          </p>
        )
      )}

      <button
        onClick={
          startMeeting
        }
      >
        Start Meeting
      </button>

    </div>
  );

}

if (
  !meetingStarted &&
  !isHost
) {

  return (
    <div>

      <h1>
        Waiting Room
      </h1>

      <p>
        Please wait until
        host starts the
        meeting...
      </p>

    </div>
  );
}


  return (
    <div
      style={{
        padding: "20px"
      }}
    >
      <h1>
        Meeting Room
      </h1>

      <p>
        <strong>
          Meeting ID:
        </strong>{" "}
        {meetingId}
      </p>

      <hr />

      <h2>
        Participants
      </h2>

{participants.map(
  (user) => (
    <div
      key={user.userId}
      style={{
        marginBottom: "10px"
      }}
    >
      <strong>
        {user.username}
      </strong>

      <br />

      <small>
        {user.socketId}
      </small>
    </div>
  )
)}

      <hr />

      <h2>
        Your Camera
      </h2>

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "500px",
          border:
            "2px solid black",
          borderRadius:
            "10px"
        }}
      />

      <h2>
  Remote Video
</h2>

<video
  ref={remoteVideoRef}
  autoPlay
  playsInline
  style={{
    width: "500px",
    border:
      "2px solid red",
    borderRadius:
      "10px"
  }}
/>

    </div>
  );

}

export default MeetingRoom;