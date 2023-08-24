const Joi = require("joi");

const roomParams = {
  room_create: {
    body: Joi.object({
      name: Joi.string().required(),
      availability: Joi.boolean().required(),
    }),
  },
};

export default roomParams;
