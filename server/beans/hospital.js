const Hospital = require("../../server/models/hospital");
const Appointment = require("../../server/models/appointment");
const Doctor = require("../models/doctor");
const Rooms = require("../../server/models/room");
const Patient = require("../../server/models/patient");
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
    let srt = await Hospital.find({}).select(
      "-_id name address call_num doctorsId"
    );

    if (!srt)
      return next(
        new APIError(ErrMessages.hospitalfound, httpStatus.UNAUTHORIZED, true)
      );

    next(srt);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function get_hospital(req, res, next) {
  try {
    let hospita_id = req.query.hospita_id;

    let hptl = await Hospital.find({ _id: hospita_id });

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
    let { hospita_id, address } = req.query;

    let hptl = await Hospital.updateOne({ _id: hospita_id }, { address });

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
