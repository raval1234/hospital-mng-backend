const Rooms = require("../../server/models/room");
const Appoint = require("../../server/models/appointment");
const Patient = require("../../server/models/patient");
const nodemailer = require("nodemailer");
import config from "../../config/config";
import httpStatus from "http-status";
import APIError from "../helpers/APIError";
const ObjectId = require("mongoose").Types.ObjectId;
const { ErrMessages, SuccessMessages } = require("../helpers/AppMessages");

async function sendresetpassword(name, email) {
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
      html: "<p>Hii " + name + " this message from HMS project.</p>",
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email Has been sent: ", info.response);
      }
    });
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
}

async function c_patient(req, res, next) {
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
      doctor,
    } = req.body;

    let patient_exi = await Patient.findOne({ email });

    if (patient_exi)
      return next(
        new APIError(ErrMessages.patient, httpStatus.UNAUTHORIZED, true)
      );

    let patients = await Patient.create({
      first_name,
      last_name,
      email,
      dob,
      gender,
      weight,
      height,
      diseases,
      doctor,
    });

    // if (!patients)
    //   return next(
    //     new APIError(ErrMessages.patientcreate, httpStatus.UNAUTHORIZED, true)
    //   );

    const userData = await Patient.findOne({ email });
    sendresetpassword(userData.first_name, userData.email);
    console.log("user data : ", userData);

    next(SuccessMessages.patientcreate);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function list_patient(req, res, next) {
  try {
    // let populate = [{ path: "doctor", select: "-_id name " }];
    // let srt = await Patient.find({})
    //   .select(
    //     "-_id first_name last_name email dob gender weight height diseases doctor"
    //   )
    //   .populate(populate);

    let doctor = req.query.doctor;

    let srt = await Patient.find({ doctor }).select(
      "-_id first_name last_name email dob gender weight height diseases "
    );
    console.log(srt);

    if (!srt)
      return next(
        new APIError(ErrMessages.patientfound, httpStatus.UNAUTHORIZED, true)
      );

    next(srt);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function sort_patient(req, res, next) {
  try {
    let srt = await Patient.find({})
      .sort({ first_name: 1 })
      .select("-_id first_name last_name");

    if (!srt)
      return next(
        new APIError(ErrMessages.patientfound, httpStatus.UNAUTHORIZED, true)
      );

    next(srt);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function search_patient(req, res, next) {
  try {
    let email = req.query.email;

    let srt = await Patient.find({
      email: { $regex: email, $options: "ix" },
    }).select("-_id first_name last_name");

    if (!srt)
      return next(
        new APIError(ErrMessages.patientfound, httpStatus.UNAUTHORIZED, true)
      );

    next(srt);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function delete_patient(req, res, next) {
  try {
    let { ids } = req.query;
    let fd_patient = await Patient.find({ _id: ids });
    if (!fd_patient)
      return next(
        new APIError(ErrMessages.patientfound, httpStatus.UNAUTHORIZED, true)
      );

    let fd_appointment = await Appoint.find({ patientId: ids });

    if (!fd_appointment)
      return next(
        new APIError(
          ErrMessages.appointmentnotfound,
          httpStatus.UNAUTHORIZED,
          true
        )
      );
    console.log(fd_appointment);

    for (const d of fd_appointment) {
      let fd_Room = await Rooms.find({ _id: d.Room });
      if (!fd_Room)
        return next(
          new APIError(ErrMessages.roomfound, httpStatus.UNAUTHORIZED, true)
        );
      let update_room = await Rooms.findOneAndUpdate(
        { _id: d.Room },
        { available: true }
      );
      if (!update_room)
        return next(
          new APIError(ErrMessages.roomupdate, httpStatus.UNAUTHORIZED, true)
        );

      console.log(update_room);
    }

    let dlt_patient = await Patient.findByIdAndDelete({ _id: ids });
    if (!dlt_patient)
      return next(
        new APIError(ErrMessages.patientdelete, httpStatus.UNAUTHORIZED, true)
      );
    let dlt_appointment = await Appoint.findOneAndDelete({ patientId: ids });
    if (!dlt_appointment)
      return next(
        new APIError(
          ErrMessages.appointmentdelete,
          httpStatus.UNAUTHORIZED,
          true
        )
      );

    next(SuccessMessages.patientdelete);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function update_patient(req, res, next) {
  try {
    let {
      _id,
      first_name,
      last_name,
      email,
      dob,
      gender,
      height,
      weight,
      diseases,
      doctor,
    } = req.body;

    let updatedValue = {};
    if (first_name) updatedValue.first_name = first_name;
    if (last_name) updatedValue.last_name = last_name;
    if (email) updatedValue.email = email;
    if (dob) updatedValue.dob = new Date(dob);
    if (gender) updatedValue.gender = gender;
    if (height) updatedValue.height = parseInt(height);
    if (weight) updatedValue.weight = parseInt(weight);
    if (diseases) updatedValue.diseases = diseases;
    if (doctor) {
      let doctorID = ObjectId(doctor);
      updatedValue.$push = { doctor: doctorID };
    }
    console.log(updatedValue);
    let update = await Patient.updateOne({ _id }, updatedValue);
    // let update = await Patient.updateOne({ _id }, { email, weight });
    if (!update)
      return next(
        new APIError(ErrMessages.patientupdate, httpStatus.UNAUTHORIZED, true)
      );

    next(SuccessMessages.patientupdate);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

module.exports = {
  c_patient,
  sort_patient,
  search_patient,
  update_patient,
  delete_patient,
  list_patient,
};
