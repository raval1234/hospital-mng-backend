import httpStatus from "http-status";
import APIError from "../helpers/APIError";
import jwt from "jsonwebtoken";
import { jwtSecret, expiresIn } from "../../bin/www";
import { ErrMessages, SuccessMessages } from "../helpers/AppMessages";

/**
 * authorize middleware to check if user is logged in or not
 */
async function authorize(req, res, next) {
  try {
    let token;
    let error;
    if (req.headers.authorization) {
      if (
        typeof req.headers.authorization !== "string" ||
        req.headers.authorization.indexOf("Bearer ") === -1
      ) {
        error = ErrMessages.badAuth;
      } else {
        token = req.headers.authorization.split(" ")[1];
      }
    } else {
      error = ErrMessages.tokenNot;
    }

    if (!token && error) {
      return next(new APIError(error, httpStatus.UNAUTHORIZED, true));
    }

    return jwt.verify(token, jwtSecret, async (err, decoded) => {
      if (err || !decoded || !decoded.userId) {
        return next(
          new APIError(ErrMessages.badToken, httpStatus.UNAUTHORIZED, true)
        );
      }
      const userObj = await userCtrl.getOne({ _id: decoded.userId });
      if (!userObj)
        return next(
          new APIError(ErrMessages.userNotFound, httpStatus.NOT_FOUND, true)
        );
      if (!userObj.activeSessions.includes(token))
        return next(
          new APIError(
            ErrMessages.sessionExpired,
            httpStatus.UNAUTHORIZED,
            true
          )
        );

      req.user = userObj;
      return next();
    });
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

module.exports = {
  authorize,
};
