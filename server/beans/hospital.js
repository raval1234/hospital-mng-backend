const Hospital = require("../../server/models/hospital");
const Appointment = require("../../server/models/appointment");
const Doctor = require("../models/doctor");
const Rooms = require("../../server/models/room");
const Patient = require("../../server/models/patient");
const ObjectId = require("mongoose").Types.ObjectId;
import httpStatus from "http-status";

import APIError from "../helpers/APIError";
const { ErrMessages, SuccessMessages } = require("../helpers/AppMessages");

async function c_hospital(req, res, next) {
  try {
    let { name, address, call_num } = req.body;

    let data = await Hospital.create({
      name,
      address,
      call_num,
    });

    if (!data)
      return next(
        new APIError(ErrMessages.hospitalcreate, httpStatus.UNAUTHORIZED, true)
      );

    next(SuccessMessages.hospitalcreate);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function d_hospital(req, res, next) {
  try {
    let hospita_id = req.query.hospita_id;

    let hptl = await Hospital.findOne({ _id: hospita_id });
    if (!hptl)
      return next(
        new APIError(ErrMessages.hospitalfound, httpStatus.UNAUTHORIZED, true)
      );

    if (hptl) {
      for (const d of hptl.doctorsId) {
        let doctor = await Doctor.find({ _id: d });
        if (doctor) {
          let patient = await Patient.find({ doctor: d });
          console.log(patient);
          let appointment = await Appointment.findOne({ doctorId: d });
          console.log(appointment);

          if (appointment) {
            await Rooms.updateOne(
              { _id: appointment.Room },
              { available: true }
            );
            await Appointment.deleteOne({ doctorId: d });
          }
          if (patient) await Patient.deleteOne({ doctor: d });
          await Doctor.deleteOne({ _id: d });
        }
      }
      await Hospital.deleteOne({ _id: hospita_id });
    }

    next(SuccessMessages.hospitaldelete);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function list_hospital(req, res, next) {
  try {
    // let srt = await Hospital.find({}).select(
    //   "-_id name address call_num doctorsId"
    // );

    let data = await Hospital.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctors",
          foreignField: "_id",
          as: "doctorName",
        },
      },

      {
        $project: {
          _id: 0,
          name: 1,
          "doctorName.name": 1,
          "doctorName.email": 1,
        },
      },
    ]);

    if (!data)
      return next(
        new APIError(ErrMessages.hospitalfound, httpStatus.UNAUTHORIZED, true)
      );

    next(data);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function get_hospital(req, res, next) {
  try {
    let filter = { _id: req.query._id };

    let populate = [{ path: "doctors", select: "-_id name" }];
    let hptl = await Hospital.find(filter).populate(populate);
    console.log(hptl);

    if (!hptl)
      return next(
        new APIError(ErrMessages.hospitalfound, httpStatus.UNAUTHORIZED, true)
      );

    next(hptl);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function update_hospital(req, res, next) {
  try {
    let { _id, name, call_num, address, doctors } = req.body;

    let updatedValue = {};
    if (name) updatedValue.name = name;
    if (call_num) updatedValue.call_num = call_num;
    if (address) updatedValue.address = address;
    if (doctors) {
      let doctorId = ObjectId(doctors);
      updatedValue.$push = { doctors: doctorId };
    }

    let hptl = await Hospital.updateOne({ _id }, updatedValue);

    if (!hptl)
      return next(
        new APIError(ErrMessages.hospitalupdate, httpStatus.UNAUTHORIZED, true)
      );

    next(SuccessMessages.hospitalupdate);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

module.exports = {
  c_hospital,
  d_hospital,
  update_hospital,
  get_hospital,
  list_hospital,
};
