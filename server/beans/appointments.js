import Appointment from "../models/appointment";
import Rooms from "../models/room";
import Patient from "../models/patient";
import APIError from "../helpers/APIError";
import httpStatus from "http-status";

async function c_appoint(req, res, next) {
  try { 
    let { reason, time, email, doctor, room } = req.body;

    let find_room = await Rooms.findOneAndUpdate(
      { name: room },
      { availability: false }
    );
    if (!find_room) return res.status(400).send("Room Not Found");

    let find_patient = await Patient.findOne({ email });
    if (!find_patient) return res.status(400).send("Patient Not Found");

    let appointments = await Appointment.create({
      reason,
      time,
      doctor,
      patient: find_patient._id,
      roomId: find_room._id,
    });

    if (!appointments)
      return res.status(400).send("appointments data not create");

    next(appointments);
  } catch (err) {
    return next(
      new APIError(err.message, httpStatus.INTERNAL_SERVER_ERROR, true, err)
    );
  }
}

async function list_appoint(req, res) {
  try {
    let srt = await Appointment.find({}).select(
      "-_id reason time doctorId patienId Room"
    );

    if (!srt) return res.status(400).send("patient data not create");

    res.status(200).json({ srt });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function checkout_patient(req, res) {
  try {
    let email = req.query.email;
    // console.log(email);

    let patients = await Patient.find({
      email: email,
    }).select("_id first_name");

    if (!patients) return res.status(400).send("patient data not create");

    let appoint = await Appointment.find({
      patientId: patients[0]._id,
    }).select("patientId Room");

    if (!appoint) return res.status(400).send("patient data not create");

    let room = await Rooms.updateOne(
      { _id: appoint[0].Room },
      { available: false }
    );
    if (!room) return res.status(400).send("patient data not create");
    console.log(room);

    res.status(200).json({ patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  c_appoint,
  checkout_patient,
  list_appoint,
};
