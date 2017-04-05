import express from 'express';
import expressJwt from 'express-jwt';
import experimentController from '../controllers/experiment.controller';
import userController from '../controllers/user.controller';
import config from '../../config/env';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /**
   * @api {get} /user Get current user details
   *
   * @apiName Read user
   * @apiGroup Current User
   * @apiUse Header
   * @apiUse NotFound
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": {
   *                "firstname": "John",
   *                "lastname": "Kitting",
   *                "phone": "07686833972",
   *                "email": "john@nhs.co.uk",
   *                "id": "588624076182796462cb133e"
   *              }
   *     }
   */
  .get(expressJwt({ secret: config.jwtSecret }),
       experimentController.list)
  /**
   * @api {put} /user Update current user details
   *
   * @apiName Update current user
   * @apiGroup Current User
   * @apiUse Header
   * @apiUse NotFound
   *
   * @apiParam {String} [firstname] The user firstname.
   * @apiParam {String} [lastname] The user lastname.
   * @apiParam {String} [phone] The user phone.
   * @apiParam {String} [email] The user email.
   * @apiParam {Array} [buddies] The user buddies.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": {
   *                "firstname": "John",
   *                "lastname": "Kitting",
   *                "phone": "07686833972",
   *                "email": "john@nhs.co.uk",
   *                "id": "588624076182796462cb133e"
   *              }
   *     }
   */
  .post(expressJwt({ secret: config.jwtSecret }),
       userController.loadCurrentUser,
       experimentController.create);

/** Load user when API with id route parameter is hit */
router.param('id', experimentController.load);

export default router;
