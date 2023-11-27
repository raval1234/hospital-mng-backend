import user from "../../server/models/user";
import APIError from "../helpers/APIError";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
import config from "../../config/config";
const randomstring = require("randomstring");
import { ErrMessages, SuccessMessages } from "../helpers/AppMessages";
import { updateOne } from "../models/appointment";
const secret = "euruaucciuaua";
const mongoose = require("mongoose");

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

    next(SuccessMessages.userCreate);
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
    console.log(users);
    if (!users)
      return next(
        new APIError(ErrMessages.userNotFound, httpStatus.UNAUTHORIZED, true)
      );
    let pass = await bcrypt.compare(password, users.password);
    console.log("password : ", pass);

    if (!pass)
      return next(
        new APIError(ErrMessages.wrongPassword, httpStatus.UNAUTHORIZED, true)
      );

    let tkn = await jwt.sign(
      {
        last_name: user.last_name,
      },
      secret
    );
    console.log(" token genrate : ", tkn);
    if (!tkn)
      return next(
        new APIError(ErrMessages.tokenNot, httpStatus.UNAUTHORIZED, true)
      );

    let login = await user.updateOne({ email }, { $set: { token: tkn } });

    if (!login)
      return next(
        new APIError(ErrMessages.wrongPassword, httpStatus.UNAUTHORIZED, true)
      );

    next({ Token: tkn, UserId: users._id });
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

      next(SuccessMessages.forgetPassword);
    }
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
};

async function reset_password(req, res, next) {
  try {
    let token = req.query.token;
    let find_token = await user.findOne({ token });
    if (!find_token)
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

    next(SuccessMessages.resetpassword);
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
    next(SuccessMessages.resetpassword);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}
//login three users 

async function login_user(req, res, next) {
  try {
    let { email, password } = req.body;

    let users = await user.findOne({ email });

    let pass = await bcrypt.compare(password, users.password);

    if (!pass)
      return next(
        new APIError(ErrMessages.wrongPassword, httpStatus.UNAUTHORIZED, true)
      );

    let tkn = await jwt.sign(
      {
        last_name: users.email,
      },
      secret
    );

    if (!tkn)
      return next(
        new APIError(ErrMessages.tokenNotCreated, httpStatus.UNAUTHORIZED, true)
      );

    await user.findOneAndUpdate(
      { email },
      {
        $push: {
          token: {
            $each: [tkn],
            $slice: -3,
          },
        },
      }
    );

    if (!login)
      return next(
        new APIError(ErrMessages.wrongPassword, httpStatus.UNAUTHORIZED, true)
      );

    next(SuccessMessages.loginsuch);
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
  login_user,
};
