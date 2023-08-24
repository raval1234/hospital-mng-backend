const Rooms = require("../../server/models/room");
const Appoint = require("../../server/models/appointment");
const Patient = require("../../server/models/patient");
const nodemailer = require("nodemailer");
import config from "../../config/config";
import httpStatus from "http-status";

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

async function c_patient(req, res) {
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

    if (patient_exi) return res.status(400).send("patient alredy exist");

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

    if (!patients) return res.status(400).send("patient data not create");

    const userData = await Patient.findOne({ email });
    sendresetpassword(userData.first_name, userData.email);
    console.log("user data : ", userData);
    res
      .status(200)
      .send({
        success: true,
        msg: "Please check your inbox mail and reset your Password.",
      });

    res.status(200).json({ patients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function list_patient(req, res) {
  try {
    let srt = await Patient.find({}).select(
      "-_id first_name last_name email dob gender weight height diseases doctor"
    );

    if (!srt) return res.status(400).send("patient data not create");

    res.status(200).json({ srt });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function sort_patient(req, res) {
  try {
    let srt = await Patient.find({})
      .sort({ first_name: 1 })
      .select("-_id first_name last_name");

    if (!srt) return res.status(400).send("patient data not create");

    res.status(200).json({ srt });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function search_patient(req, res) {
  try {
    let email = req.query.email;

    let srt = await Patient.find({
      email: { $regex: email, $options: "ix" },
    }).select("-_id first_name last_name");

    if (!srt) return res.status(400).send("patient data not create");

    res.status(200).json({ srt });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function delete_patient(req, res) {
  try {
    let { ids } = req.query;
    let fd_patient = await Patient.find({ _id: ids });
    if (!fd_patient) return res.status(400).send("Data Not find Patient");

    let fd_appointment = await Appoint.find({ patientId: ids });
    if (!fd_appointment)
      return res.status(400).send("Data Not find Patient Appointment");
    console.log(fd_appointment);

    for (const d of fd_appointment) {
      let fd_Room = await Rooms.find({ _id: d.Room });
      if (!fd_Room) return res.status(400).send("Data Not find Patient Rooms");

      let update_room = await Rooms.findOneAndUpdate(
        { _id: d.Room },
        { available: true }
      );
      if (!update_room)
        return res.status(400).send("Data Not deleted Patient Rooms");

      console.log(update_room);
    }

    let dlt_patient = await Patient.findByIdAndDelete({ _id: ids });
    if (!dlt_patient) return res.status(400).send("Data Not deleted : Patient");

    let dlt_appointment = await Appoint.findOneAndDelete({ patientId: ids });
    if (!dlt_appointment)
      return res.status(400).send("Data Not deleted : Appointment");

    res.status(200).json({ fd_patient, fd_appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function update_patient(req, res) {
  try {
    let { _id, email, weight } = req.query;

    let update = await Patient.updateOne({ _id }, { email, weight });
    if (!update) return res.status(400).send("Data Not find");

    res.status(200).json({ update });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// async function email_patient(req, res) {

//     try {
//         sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//         const msg = {
//           to: 'jaymdtech@gmail.com',
//           from: 'rchetan617@gmail.com', // Use the email address or domain you verified above
//           subject: 'Sending with Twilio SendGrid is Fun',
//           text: 'and easy to do anywhere, even with Node.js',
//           html: '<strong>and easy to do anywhere, even with Node.js</strong>',
//         };
//         //ES6
//         sgMail
//           .send(msg)
//           .then(() => {}, error => {
//             console.error(error);

//             if (error.response) {
//               console.error(error.response.body)
//             }
//           });
//         res.status(200).json({ msg });
//     }
//     catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// }

// const sendresetpassword = async (name, email) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             host: 'smtp.gmail.com',
//             port: 587,
//             secure: false,
//             requireTLS: true,
//             auth: {
//                 user: config.emailUser,
//                 pass: config.emailPassword
//             }
//         });

//         const mailOptions = {
//             from: config.emailUser,
//             to: email,
//             subject: 'For Reset Password',
//             html: '<p>Hii ' + name + ', your passsword.</p>'

//         }
//         transporter.sendMail(mailOptions, function (error, info) {
//             if (error) {
//                 console.log(error);
//             }
//             else {
//                 console.log("Email Has been sent: ", info.response);
//             }
//         });
//     }
//     catch (error) {
//         res.status(400).send({ success: false, msg: error.message });
//     }
// }
// const forget_password = async (req, res) => {
//     try {
//         const email = req.body.email;
//         const userData = awaitUser.findOne({ email: email });
//         if (userData) {
//             const randomstrings = randomstrings.generate();
//             const data = await User.updateOne({ email: email }, { $set: { token: randomstrings } });
//             sendresetpassword(userData.name, userData.email, randomstrings)
//             res.status(200).send({ success: true, msg: "Please check your inbox mail and reset your Password." });
//         }
//         else {
//             res.status(500).send({ success: true, msg: "This Email does not exists." });
//         }
//     }
//     catch (error) {
//         res.status(400).send({ success: false, msg: error.message });
//     }
// }

module.exports = {
  c_patient,
  sort_patient,
  search_patient,
  update_patient,
  delete_patient,
  list_patient,
  // email_patient
  // testSendEmailFromTemplate
};