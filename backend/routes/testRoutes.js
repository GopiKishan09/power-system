const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");

router.get("/protected", auth, (req, res) => {
  res.json({
    message: "You are authorized",
    userId: req.userId
  });
});

module.exports = router;
