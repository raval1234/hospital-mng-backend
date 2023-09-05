const Rooms = require("../../server/models/room");
import APIError from "../helpers/APIError";
const { ErrMessages, SuccessMessages } = require("../helpers/AppMessages");

async function c_room(req, res, next) {
  try {
    let { name, available } = req.body;
    let rooms = await Rooms.create({
      name,
      available,
    });
    if (!rooms)
      return next(
        new APIError(ErrMessages.roomcrete, httpStatus.UNAUTHORIZED, true)
      );

    next(SuccessMessages.roomcrete);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function room_available(req, res, next) {
  try {
    let rooms = await Rooms.find({ available: { $eq: false } }).select("name");
    if (!rooms)
      return next(
        new APIError(ErrMessages.roomnotfound, httpStatus.UNAUTHORIZED, true)
      );
    next(rooms);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

module.exports = {
  c_room,
  room_available,
};
