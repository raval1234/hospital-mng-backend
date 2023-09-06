const Doctor = require("../../server/models/doctor");
const Patient = require("../../server/models/patient");
const Hospital = require("../../server/models/hospital");
const Appointment = require("../../server/models/appointment");
import APIError from "../helpers/APIError";
import httpStatus from "http-status";
const nodemailer = require("nodemailer");
import config from "../../config/config";
import { ErrMessages, SuccessMessages } from "../helpers/AppMessages";

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

async function c_doctor(req, res, next) {
  try {
    let { name, call_num, email, gender, hospitalId } = req.body;

    let data = await Doctor.create({
      name,
      call_num,
      email,
      gender,
      hospitalId,
    });

    if (!data)
      return next(
        new APIError(ErrMessages.doctordata, httpStatus.UNAUTHORIZED, true)
      );

    let doctor_id = await Hospital.findByIdAndUpdate(
      { _id: data.hospitalId },
      { $push: { doctorsId: data._id } }
    );

    if (!doctor_id)
      return next(
        new APIError(ErrMessages.doctorUpdate, httpStatus.UNAUTHORIZED, true)
      );

    const userData = await Doctor.findOne({ email });

    if (!userData)
      return next(
        new APIError(ErrMessages.doctorfind, httpStatus.UNAUTHORIZED, true)
      );

    sendresetpassword(userData.name, userData.email);

    console.log("user data : ", userData);

    next(SuccessMessages.doctor);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function list_doctor(req, res, next) {
  try {
    let srt = await Doctor.find({}).select(
      "-_id name call_num email gender hospitalId"
    );

    let srts = await Doctor.aggregate([
      {
        $project: {
          _id: 0,
          name: 1,
          email: 1,
          call_num: 1,
          gender: 1,
          hospitalId: 1,
        },
      },
    ]);

    if (!srts)
      return next(
        new APIError(ErrMessages.doctorfind, httpStatus.UNAUTHORIZED, true)
      );

    next(srts);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function pd_data(req, res) {
  try {
    let dts = await Patient.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctor",
          foreignField: "_id",
          as: "enrollee_info",
        },
      },
    ]);

    next(dts);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function update_doctor(req, res, next) {
  try {
    let { ids, email } = req.query;

    let doctorEmail = await Doctor.findOne({ email });

    if (doctorEmail) {
      return next(
        new APIError(ErrMessages.emailAlredy, httpStatus.CONFLICT, true)
      );
    }

    let update = await Doctor.updateOne({ ids }, { email });

    if (!update)
      return next(
        new APIError(ErrMessages.doctorUpdate, httpStatus.UNAUTHORIZED, true)
      );

    next(SuccessMessages.doctorupdate);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function appoint_doctor(req, res, next) {
  try {
    let dts = await Appointment.aggregate([
      {
        $lookup: {
          from: "doctors",
          localField: "doctorId",
          foreignField: "_id",
          as: "enrollee_info",
        },
      },
      {
        $project: {
          doctor: { $first: "$enrollee_info" },
        },
      },
    ]);
    if (!dts)
      return next(
        new APIError(
          ErrMessages.appointmentnotfound,
          httpStatus.UNAUTHORIZED,
          true
        )
      );

    next(dts);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function get_doctor(req, res, next) {
  try {
    // Pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    let skip = (page - 1) * limit;

    // Sorting
    let sort = {};
    if (req.query.sort) {
      sort[req.query.sort] = 1; // 1 for ascending, -1 for descending
    }

    // Filtering
    let filter = {};
    if (req.query.date) {
      filter.date = new Date(req.query.date);
    }

    // Searching
    if (req.query.search) {
      filter.name = new RegExp(req.query.search, "i"); // case-insensitive search
    }

    let srts = await Doctor.aggregate([
      {
        $match: filter,
      },
      {
        $project: {
          _id: 0,
          name: 1,
          email: 1,
          call_num: 1,
          gender: 1,
          hospitalId: 1,
        },
      },
    ])
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (!srts || srts.length === 0)
      return next(
        new APIError(ErrMessages.doctorfind, httpStatus.UNAUTHORIZED, true)
      );

    res.json(srts); // Send the results back as a JSON response
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

module.exports = {
  c_doctor,
  pd_data,
  update_doctor,
  list_doctor,
  appoint_doctor,
  get_doctor,
};
