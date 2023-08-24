import httpStatus from "http-status";
import APIError from "./APIError";
import { roles, allRoles, roleObj } from "./roles";
import { ErrMessages, SuccessMessages } from "../helpers/AppMessages";

/**
 * create user middleware
 */
async function checkcreateUserPermission(req, res, next) {
  const { role } = req.body;
  const creaters = [roleObj.admin];

  if (
    !creaters.includes(req.user.role) ||
    (req.user.role === roleObj.admin && role !== roleObj.technician)
  ) {
    return next(
      new APIError(ErrMessages.unauthorizedUser, httpStatus.FORBIDDEN, true)
    );
  }
  next();
}

/**
 * create user middleware
 */
async function createAnnouncement(req, res, next) {
  const { visibleTo } = req.body;
  const creaters = [roleObj.admin, roleObj.admin];
  const adminCanCreate = [roleObj.client, roleObj.technician];

  if (
    !creaters.includes(req.user.role) ||
    (req.user.role === roleObj.admin && !adminCanCreate.includes(visibleTo))
  ) {
    return next(
      new APIError(ErrMessages.unauthorizedUser, httpStatus.FORBIDDEN, true)
    );
  }
  next();
}

/**
 * check user permission
 */
const checkPermissions = (permission) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new APIError("unauthorized", httpStatus.UNAUTHORIZED, true));

    if (!allRoles[req.user.role].includes(permission)) {
      return next(
        new APIError(ErrMessages.unauthorizedUser, httpStatus.FORBIDDEN, true)
      );
    }
    next();
  };
};

module.exports = {
  checkcreateUserPermission,
  checkPermissions,
  createAnnouncement,
};
