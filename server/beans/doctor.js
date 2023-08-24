const Doctor = require("../../server/models/doctor");
const Patient = require("../../server/models/patient");
const Hospital = require("../../server/models/hospital");
const Appointment = require("../../server/models/appointment");
import APIError from "../helpers/APIError";
import httpStatus from "http-status";
const nodemailer = require("nodemailer");
import config from "../../config/config";

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

    if (!data) return res.status(400).send("Data not Found");

    let doctor_id = await Hospital.findByIdAndUpdate(
      { _id: data.hospitalId },
      { $push: { doctorsId: data._id } }
    );

    if (!doctor_id) return res.status(400).send("Data not Found");

    const userData = await Doctor.findOne({ email });

    if (!doctor_id) return res.status(400).send("Data not Found");

    sendresetpassword(userData.name, userData.email);
    console.log("user data : ", userData);
    res
      .status(200)
      .send({
        success: true,
        msg: "Please check your inbox mail and reset your Password.",
      });
    console.log(data);

    next(doctor_id);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function list_doctor(req, res) {
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

    if (!srt) return res.status(400).send("patient data not create");

    res.status(200).json({ srts });
  } catch (err) {
    res.status(400).json({ message: err.message });
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

    res.status(200).json({ dts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function update_doctor(req, res) {
  try {
    let { ids, email } = req.query;

    let update = await Doctor.updateOne({ _id: ids }, { email });
    if (!update) return res.status(400).send("Data Not find");

    res.status(200).json({ update });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function appoint_doctor(req, res) {
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

    res.status(200).json({ dts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  c_doctor,
  pd_data,
  update_doctor,
  list_doctor,
  appoint_doctor,
};
