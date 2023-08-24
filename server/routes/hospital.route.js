import express from "express";
import validate from "express-validation";
import hospitanParams from "../params/hospital.params";
import hospital from "../beans/hospital";
const router = express.Router();

router.post(
  "/hospitalcre",
  validate(hospitanParams.hospital_create),
  hospital.c_hospital
);
// route.post('/hospitalcre',validate(authParams.login), control.c_hospital);
router.get(
  "/hospitaldlt",
  validate(hospitanParams.delete_hospital),
  hospital.d_hospital
);
router.put(
  "/hospitalupdate",
  validate(hospitanParams.hospital_update),
  hospital.update_hospital
);
router.get(
  "/hospitalget",
  validate(hospitanParams.hospital_get),
  hospital.get_hospital
);
router.get("/hospitallist", hospital.list_hospital);

module.exports = router;
