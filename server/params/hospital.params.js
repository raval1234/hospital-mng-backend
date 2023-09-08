const Joi = require("joi");

const hospitanParams = {
  hospital_create: {
    body: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      call_num: Joi.string().required(),
    }),
  },
  hospital_update: {
    body: Joi.object({
      _id: Joi.string().required(),
    }),
  },
  hospital_get: {
    query: Joi.object({
      _id: Joi.string().required(),
    }),
  },
  delete_hospital: {
    query: Joi.object({
      hospita_id: Joi.string().required(),
    }),
  },
};

export default hospitanParams;
