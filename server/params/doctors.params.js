const Joi = require("joi");

const doctorsParams = {
  doctors_create: {
    body: Joi.object({
      name: Joi.string().required(),
      call_num: Joi.string().required(),
      email: Joi.string().required(),
      gender: Joi.string().required(),
      hospitalId: Joi.string().hex().required(),
    }),
  },
  doctors_update: {
    query: Joi.object({
      email: Joi.string().required(),
      _id: Joi.string().hex().required(),
    }),
  },
};

export default doctorsParams;
