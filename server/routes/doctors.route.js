import express from 'express';
import validate from 'express-validation';
import doctorParams from '../params/doctors.params';
import doctor from'../beans/doctor';
const router = express.Router();


router.post('/doctorcre',validate(doctorParams.doctors_create) ,doctor.c_doctor);
router.get('/pddata', doctor.pd_data);
router.put('/updatedoctor',validate(doctorParams.doctors_update), doctor.update_doctor);
router.get('/doctorlist', doctor.list_doctor);
router.get('/doctorappoint', doctor.appoint_doctor);
router.get('/getdoctor',doctor.get_doctor)
module.exports = router;
 

