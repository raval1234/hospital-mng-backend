import express from "express";
import validate from "express-validation";
import userParams from "../params/user.params";
import user from "../beans/user";
const router = express.Router();

router.post("/usercre", validate(userParams.create_user), user.c_user);
router.get("/login", validate(userParams.user_login), user.login);

router.post(
  "/forgotPassword",
  validate(userParams.user_forget),
  user.forget_password
);
router.get(
  "/reset-password",
  validate(userParams.user_reset),
  user.reset_password
);
router.post("/reset", validate(userParams.reset), user.reset);
router.get("/login-user",user.login_user);

module.exports = router; 
 