const Hospital = require("../../server/models/hospital");
const Appointment = require("../../server/models/appointment");
const Doctor = require("../models/doctor");
const Rooms = require("../../server/models/room");
const Patient = require("../../server/models/patient");

async function c_hospital(req, res) {
  try {
    let { name, address, call_num } = req.body;

    let data = await Hospital.create({
      name,
      address,
      call_num,
    });
    if (!data) return res.status(400).send("Data Not Create");

    res.status(200).json({ message: "hospital created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function d_hospital(req, res) {
  try {
    let hospita_id = req.query.hospita_id;

    let hptl = await Hospital.findOne({ _id: hospita_id });
    if (!hptl) return res.status(400).send("Data Not find");

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

    res.status(200).json({ hptl });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function list_hospital(req, res) {
  try {
    let srt = await Hospital.find({}).select(
      "-_id name address call_num doctorsId"
    );

    if (!srt) return res.status(400).send("patient data not create");

    res.status(200).json({ srt });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function get_hospital(req, res) {
  try {
    let hospita_id = req.query.hospita_id;

    let hptl = await Hospital.find({ _id: hospita_id });

    if (!hptl) return res.status(400).send("Data Not find");

    res.status(200).json({ hptl });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function update_hospital(req, res) {
  try {
    let { hospita_id, address } = req.query;

    let hptl = await Hospital.updateOne({ _id: hospita_id }, { address });

    if (!hptl) return res.status(400).send("Data Not find");

    res.status(200).json({ hptl });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  c_hospital,
  d_hospital,
  update_hospital,
  get_hospital,
  list_hospital,
};

