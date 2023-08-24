const Joi = require("joi");

const patientParams = {
  create_patient: {
    body: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().required(),
      dob: Joi.string().required(),
      gender: Joi.string().required(),
      weight: Joi.number().required(),
      height: Joi.number().required(),
      diseases: Joi.array().items(Joi.string()).required(),
      doctor: Joi.string().hex().required(),
    }),
  },
  search_patient: {
    query: Joi.object({
      email: Joi.string().required(),
    }),
  },
  patient_update: {
    query: Joi.object({
      _id: Joi.string().hex().required(),
      email: Joi.string().required(),
      weight: Joi.string().required(),
    }),
  },
  delete_patient: {
    query: Joi.object({
      _id: Joi.string().hex().required(),
    }),
  },
};

export default patientParams;
