import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [invitedMeetings, setInvitedMeetings] = useState([]);
  const [inviteUsers, setInviteUsers] = useState({});

  const token = localStorage.getItem("token");

  const fetchMeetings = async () => {
    try {
      const res = await api.get("/meetings/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMeetings(res.data);
    } catch (error) {
      console.error("Fetch Meetings Error:", error);
    }
  };

  const fetchInvitedMeetings = async () => {
    try {
      const res = await api.get("/meetings/invited", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setInvitedMeetings(res.data);
    } catch (error) {
      console.error("Fetch Invited Meetings Error:", error);
    }
  };

  useEffect(() => {
    fetchMeetings();
    fetchInvitedMeetings();
  }, []);

  const createMeeting = async () => {
    if (!title.trim()) {
      alert("Enter meeting title");
      return;
    }

    try {
      await api.post(
        "/meetings",
        { title },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTitle("");

      fetchMeetings();
    } catch (error) {
      console.error("Create Meeting Error:", error);
      alert("Failed to create meeting");
    }
  };

  const inviteUser = async (meetingId) => {
    if (!inviteUsers[meetingId]?.trim()) {
      alert("Enter username");
      return;
    }

    try {
      await api.post(
        `/meetings/${meetingId}/invite`,
        {
          username: inviteUsers[meetingId],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Invitation Sent");

      setInviteUsers((prev) => ({
        ...prev,
        [meetingId]: "",
      }));
    } catch (error) {
      console.error("Invite Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to send invitation"
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          value={title}
          placeholder="Meeting Title"
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <button
          style={{ marginLeft: "10px" }}
          onClick={createMeeting}
        >
          Create Meeting
        </button>
      </div>

      <hr />

      <h2>My Meetings</h2>

      {meetings.length === 0 ? (
        <p>No meetings created yet.</p>
      ) : (
        meetings.map((meeting) => (
          <div
            key={meeting.id}
            style={{
              border: "1px solid #ccc",
              padding: "20px",
              marginTop: "15px",
              borderRadius: "8px",
            }}
          >
            <h3>{meeting.title}</h3>

            <p>
              <strong>ID:</strong>{" "}
              {meeting.id}
            </p>

            <input
              placeholder="Invite username"
              value={
                inviteUsers[meeting.id] || ""
              }
              onChange={(e) =>
                setInviteUsers((prev) => ({
                  ...prev,
                  [meeting.id]:
                    e.target.value,
                }))
              }
            />

            <button
              style={{ marginLeft: "10px" }}
              onClick={() =>
                inviteUser(meeting.id)
              }
            >
              Invite
            </button>

            <button
              style={{ marginLeft: "10px" }}
              onClick={() =>
                navigate(
                  `/meeting/${meeting.id}`
                )
              }
            >
              Join Meeting
            </button>
          </div>
        ))
      )}

      <hr />

      <h2>Invited Meetings</h2>

      {invitedMeetings.length === 0 ? (
        <p>No invitations yet.</p>
      ) : (
        invitedMeetings.map((invite) => (
          <div
            key={invite.id}
            style={{
              border: "1px solid green",
              padding: "20px",
              marginTop: "15px",
              borderRadius: "8px",
            }}
          >
            <h3>
              {invite.meeting.title}
            </h3>

            <p>
              <strong>ID:</strong>{" "}
              {invite.meeting.id}
            </p>

            <p>
              Status: {invite.status}
            </p>

            <button
              onClick={() =>
                navigate(
                  `/meeting/${invite.meeting.id}`
                )
              }
            >
              Join Meeting
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;