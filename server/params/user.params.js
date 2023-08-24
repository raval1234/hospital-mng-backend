const Joi = require("joi");

const userParams = {
  create_user: {
    body: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().required(),
      dob: Joi.string().required(),
      gender: Joi.string().required(),
      weight: Joi.number().required(),
      height: Joi.number().required(),
      diseases: Joi.array().items(Joi.string()).required(),
      password: Joi.string()
        .min(8)
        .regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)
        .required()
        .error(() => ({
          message:
            "Password must contain at least one upper case letter, one lower case letter, one number, and one special character.Password must be at least 8 characters long",
        })),
      doctor: Joi.string().hex().required(),
    }),
  },
  user_login: {
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string()
        .required()
        .error(() => ({
          message: "password does not match please valide password",
        })),
    }),
  },
  user_forget: {
    body: Joi.object({
      email: Joi.string().required(),
    }),
  },
  user_reset: {
    body: Joi.object({
      password: Joi.string()
        .min(8)
        .regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/)
        .required()
        .error(() => ({
          message:
            "Password must contain at least one upper case letter, one lower case letter, one number, and one special character.Password must be at least 8 characters long",
        })),
    }),
  },
  reset: {
    body: Joi.object({
      email: Joi.strict().required(),
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    }),
  },
};

export default userParams;
