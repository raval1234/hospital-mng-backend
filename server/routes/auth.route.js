import express from "express";
// import validate from "express-validation";
// import authParams from "../params/auth.paramas";
import auth from "../beans/auth";
const router = express.Router();

router.route("/login").post(auth.login);

module.exports = router;
