import express from "express";
import appointmentRoutes from "./appointment.route";
import hospitalRoutes from "./hospital.route";
import doctorRoutes from "./doctors.route";
import patientRoutes from "./patient.route";
import roomRoutes from "./room.route";
import userRoutes from "./user.route";
// import {authRoutes} from './auth';
const router = express.Router();
import { authorize } from '../beans/auth';

// /*list APIs */
// router.use('/auth', authRoutes);

// router.use(authorize);

/* authorized routes APIs */


// router.use('/auth', authRoutes);

router.use(authorize);
router.use("/user", userRoutes);
router.use("/appointment", appointmentRoutes);
router.use("/hospital", hospitalRoutes);
router.use("/doctor", doctorRoutes);
router.use("/patient", patientRoutes);
router.use("/room", roomRoutes);
router.use("/user", userRoutes);

module.exports = router;
