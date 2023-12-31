import express from "express";
import appointmentRoutes from "./appointment.route";
import hospitalRoutes from "./hospital.route";
import doctorRoutes from "./doctors.route";
import patientRoutes from "./patient.route";
// import { authorize } from '../beans/auth';
import roomRoutes from "./room.route";
import userRoutes from "./user.route";
import Pagination from "../beans/pagination";

const router = express.Router();

// /*list APIs */


/* authorized routes APIs */
router.use("/appointment", appointmentRoutes);
router.use("/hospital", hospitalRoutes);
router.use("/doctor", doctorRoutes);
router.use("/patient", patientRoutes);
router.use("/room", roomRoutes);
router.use("/user", userRoutes);
router.use("/pagination", Pagination.pagination);
router.use("/pagination_doctor", Pagination.pagination_doctor);

module.exports = router;
