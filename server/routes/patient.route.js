import express from "express";
import validate from "express-validation";
import patientParams from "../params/patient.params";
import patient from "../beans/patient";
const router = express.Router();

router.post(
  "/patientcre",
  validate(patientParams.create_patient),
  patient.c_patient
);
router.get("/sortpatient", patient.sort_patient);
router.get("/patientlist", patient.list_patient);
router.get(
  "/searchpatient",
  validate(patientParams.search_patient),
  patient.search_patient
);
router.put(
  "/updatepatient",
  validate(patientParams.patient_update),
  patient.update_patient
);
router.get(
  "/deletepatient",
  validate(patientParams.delete_patient),
  patient.delete_patient
);
// router.post('/email',patient.email_patient);
// router.get('/getmail',patient.sendresetpassword)
module.exports = router;
