const express = require("express");

const prisma = require("../prisma");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();



router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {

      if (!req.body) {
        return res.status(400).json({
          message: "Request body missing"
        });
      }

      const { title } = req.body;

      if (!title) {
        return res.status(400).json({
          message: "Title is required"
        });
      }

      const meeting =
        await prisma.meeting.create({
          data: {
            title,
            hostId: req.user.id
          }
        });

      res.status(201).json(meeting);

    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Server Error"
      });
    }
  }
);


router.get(
  "/my",
  authMiddleware,
  async (req, res) => {

    try {

      const meetings =
        await prisma.meeting.findMany({
          where: {
            hostId: req.user.id
          }
        });

      res.json(meetings);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server Error"
      });

    }
  }
);


router.post(
  "/:meetingId/invite",
  authMiddleware,
  async (req, res) => {

    try {

      const { meetingId } = req.params;
      const { username } = req.body;

      // Find invited user
      const user =
        await prisma.user.findUnique({
          where: {
            username
          }
        });

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      // Verify meeting exists
      const meeting =
        await prisma.meeting.findUnique({
          where: {
            id: meetingId
          }
        });

      if (!meeting) {
        return res.status(404).json({
          message: "Meeting not found"
        });
      }

      // Only host can invite
      if (meeting.hostId !== req.user.id) {
        return res.status(403).json({
          message: "Not authorized"
        });
      }

      const existingInvitation =
  await prisma.invitation.findFirst({
    where: {
      meetingId,
      userId: user.id
    }
  });

      if (existingInvitation) {
        return res.status(400).json({
          message: "User already invited"
        });
      }

      const invitation =
        await prisma.invitation.create({
          data: {
            meetingId,
            userId: user.id
          }
        });

      res.status(201).json(invitation);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server Error"
      });

    }
  }
);

router.get(
  "/invited",
  authMiddleware,
  async (req, res) => {

    try {

      const invitations =
        await prisma.invitation.findMany({
          where: {
            userId: req.user.id
          },
          include: {
            meeting: true
          }
        });

      res.json(invitations);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server Error"
      });

    }
  }
);

router.post(
  "/:id/start",
  authMiddleware,
  async (req, res) => {

    try {

      const meeting =
        await prisma.meeting.findUnique({
          where: {
            id: req.params.id
          }
        });

        console.log(
  "MEETING HOST:",
  meeting.hostId
);

console.log(
  "CURRENT USER:",
  req.user.id);

      if (!meeting) {
        return res.status(404).json({
          message: "Meeting not found"
        });
      }

      if (
        meeting.hostId !== req.user.id
      ) {

        return res.status(403).json({
          message:
            "Only host can start meeting"
        });

      }

      const updatedMeeting =
        await prisma.meeting.update({
          where: {
            id: req.params.id
          },
          data: {
            isStarted: true
          }
        });

      res.json(updatedMeeting);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server Error"
      });

    }

  }
);

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {

    try {

      const meeting =
        await prisma.meeting.findUnique({
          where: {
            id: req.params.id
          }
        });

      if (!meeting) {

        return res.status(404).json({
          message: "Meeting not found"
        });

      }

      res.json(meeting);

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server Error"
      });

    }

  }
);

router.post(
  "/:meetingId/join",
  authMiddleware,
  async (req, res) => {

    try {

      const { meetingId } = req.params;

      const invitation =
        await prisma.invitation.findFirst({
          where: {
            meetingId,
            userId: req.user.id
          }
        });

      if (!invitation) {
        return res.status(403).json({
          message: "Not invited to this meeting"
        });
      }

      res.json({
        message: "Access granted",
        meetingId
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        message: "Server Error"
      });

    }
  }
);



module.exports = router;