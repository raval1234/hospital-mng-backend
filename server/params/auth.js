import Joi from 'joi';

const authParams = {
  //POST auth/login
  isLogin: {
    body: Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    })
  }
};

export default authParams;