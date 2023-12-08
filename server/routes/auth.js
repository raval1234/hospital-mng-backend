import express from 'express';
import { validate } from 'express-validation';
import authParams from '../params/auth';
import auth from '../beans/auth';
const router = express.Router();

router
  .route('/isLogin')
  //** POST auth/isLogin - user Login*/
  .post(validate(authParams.isLogin), auth.isLogin);

module.exports = router;