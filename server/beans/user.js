const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
import user from "../../server/models/user";
import APIError from "../helpers/APIError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import config from "../../config/config";
import { jwtSecret } from "../../bin/www";
import { ErrMessages, SuccessMessages } from "../helpers/AppMessages";



async function c_user(req, res, next) {
  try {
    let {
      first_name,
      last_name,
      email,
      dob,
      gender,
      weight,
      height,
      diseases,
      token,
      password,
      doctor,
    } = req.body;

    let users = await user.create({
      first_name,
      last_name,
      email,
      dob,
      gender,
      weight,
      height,
      diseases,
      token,
      password,
      doctor,
    });

    if (!users)
      return next(
        new APIError(ErrMessages.userCreate, httpStatus.UNAUTHORIZED, true)
      );

    next(users);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function login(req, res, next) {
  try {
    let { email, password } = req.body;
    let users = await user.findOne({ email });
  
    if (!users)
      return next(
        new APIError(ErrMessages.userNotFound, httpStatus.UNAUTHORIZED, true)
      );
    let pass = await bcrypt.compare(password, users.password);
   
    if (!pass)
      return next(
        new APIError(ErrMessages.wrongPassword, httpStatus.UNAUTHORIZED, true)
      );

    let tkn = await jwt.sign(
      {
        userId: user._id,
      },
      jwtSecret
    );
 
    if (!tkn)
      return next(
        new APIError(ErrMessages.tokenNot, httpStatus.UNAUTHORIZED, true)
      );

    let login = await user.updateOne({ email }, { $set: { token: tkn } });

    if (!login)
      return next(
        new APIError(ErrMessages.wrongPassword, httpStatus.UNAUTHORIZED, true)
      );
      
    req.session.user_id= users._id
    
    next({ Token: tkn, user_id: users._id });
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function sendresetpassword(name, email, token) {
  try {
    const transporter = await nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: config.emailUser,
        pass: config.emailPassword,
      },
    });

    const mailOptions = await {
      from: config.emailUser,
      to: email,
      subject: "For Reset Password",
      html: `Hii  ${name} Please Reset you password <a href="http://localhost:5050/user/reset-password?token=${token}"> reset your password</a>`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email Has been sent: ", info.response);
      }
    });
  } catch (error) {
    console.log({ success: false, msg: error.message });
  }
}

const forget_password = async (req, res, next) => {
  try {
    let email = req.body.email;

    let findMail = await user.findOne({ email });
    if (findMail) {
      let tkn = randomstring.generate();

      let data = await user.updateOne(
        { email: email },
        { $set: { token: tkn } }
      );
      if (!data)
        return next(
          new APIError(ErrMessages.update, httpStatus.UNAUTHORIZED, true)
        );
      sendresetpassword(findMail.first_name, findMail.email, tkn);

      next(
        new APIError(
          SuccessMessages.forgetPassword,
          httpStatus.UNAUTHORIZED,
          true
        )
      );
    }
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
};

async function reset_password(req, res, next) {
  try {
    let tokens = req.query.tokens;
    let find_token = await user.findOne({ tokens });
    if (!tokens)
      return next(
        new APIError(ErrMessages.tokenNot, httpStatus.UNAUTHORIZED, true)
      );

    let pass = req.body.password;
    let password = await bcrypt.hash(pass, 10);
    let set_pass = await user.findByIdAndUpdate(
      { _id: find_token._id },
      { $set: { password, token: "" } }
    );
    if (!set_pass)
      return next(
        new APIError(ErrMessages.sessionExpired, httpStatus.UNAUTHORIZED, true)
      );
    res.status(200).json({ success: true, msg: "reset password successfully" });
    next(set_pass);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function reset(req, res, next) {
  try {
    let { email, currentPassword, newPassword } = req.body;

    let users = await user.findOne({ email });
    console.log("user id", users._id);
    if (!users)
      return next(
        new APIError(ErrMessages.userNotFound, httpStatus.UNAUTHORIZED, true)
      );

    let isMatch = await bcrypt.compare(currentPassword, users.password);
    console.log(isMatch);

    if (!isMatch)
      return next(
        new APIError(ErrMessages.currentPassword, httpStatus.UNAUTHORIZED, true)
      );

    let np = await bcrypt.hash(newPassword, 12);
    let update = await user.findOneAndUpdate(
      { _id: users._id },
      { password: np }
    );

    if (!update)
      return next(
        new APIError(ErrMessages.update, httpStatus.UNAUTHORIZED, true)
      );

    // res.send({ message: "Password changed successfully!" });
    next(update);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

module.exports = {
  c_user,
  login,
  forget_password,
  reset_password,
  reset,
};
