import express from 'express';
import validate from 'express-validation';
import expressJwt from 'express-jwt';
import paramValidation from '../../config/param-validation';
import userController from '../controllers/user.controller';
import config from '../../config/env';
import jwt from '../../config/jwt';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /**
   * @apiDefine UserResponse
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *   {
   *     "status":"success",
   *     "data":{
   *         "firstname":"John",
   *         "lastname":"Kitting",
   *         "phone":"+447686833972",
   *         "email":"john@gmail.com",
   *         "id":"58dcc9212c252a077e3973ec"
   *     }
   *   }
   */

  /**
   * @api {get} /users Get list of users
   *
   * @apiName Users list
   * @apiGroup Users
   * @apiUse Header
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": [
   *              {
   *                "firstname": "John",
   *                "lastname": "Kitting",
   *                "phone": "07686833972",
   *                "email": "john@nhs.co.uk",
   *                "id": "588624076182796462cb133e"
   *              }
   *            ]
   *     }
   */
  .get(expressJwt({ secret: config.jwtSecret }), userController.list)

  /**
   * @api {post} /users Register new user
   *
   * @apiName Register user
   * @apiGroup Users
   * @apiUse UserResponse
   *
   * @apiParam {String} firstname the user firstname.
   * @apiParam {String} lastname the user lastname.
   * @apiParam {String} phone the user phone.
   * @apiParam {String} email the user email.
   *
   *
   * @apiError ValidationError Invalid params.
   *
   * @apiErrorExample {json} Error-Response:
   *     HTTP/1.1 500 Error
   *     {
   *       "status": "error",
   *       "code": "10006",
   *       "message": "User validation failed"
   *     }
   */
  .post(validate(paramValidation.createUser), userController.create);

router.route('/:id')
  /**
   * @api {get} /users/:id Get user details
   *
   * @apiName Read user
   * @apiGroup Users
   * @apiUse Header
   * @apiUse NotFound
   * @apiUse UserResponse
   *
   * @apiParam {String} id The user unique ID.
   *
   */
  .get(expressJwt({ secret: config.jwtSecret }), userController.get)

  /**
   * @api {put} /users/:id Update user details
   *
   * @apiName Update user
   * @apiGroup Users
   * @apiUse Header
   * @apiUse NotFound
   * @apiUse UserResponse
   *
   * @apiParam {String} id The user unique ID.
   * @apiParam {String} [firstname] The user firstname.
   * @apiParam {String} [lastname] The user lastname.
   * @apiParam {String} [phone] The user phone.
   * @apiParam {String} [email] The user email.
   *
   */
  .put(expressJwt({ secret: config.jwtSecret }),
       validate(paramValidation.updateUser),
       userController.update)

  /**
   * @api {delete} /users/:id Delete a user
   *
   * @apiName Delete user
   * @apiGroup Users
   * @apiUse Header
   * @apiUse NotFound
   *
   * @apiParam {String} id The user unique ID.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": "Account was successfully deleted."
   *     }
   */
  .delete(expressJwt({ secret: config.jwtSecret }), userController.remove);

router.route('/:id/role')
  /**
   * @api {post} /users/:id/role Assign role
   *
   * @apiName Assign staff role
   * @apiGroup Users
   * @apiUse Header
   * @apiUse NotFound
   * @apiUse UserResponse
   *
   * @apiParam {String} id The user unique ID.
   *
   */
  .post(expressJwt({ secret: config.jwtSecret }),
        jwt.checkPermission(config.adminRole),
        userController.assignRole);

/** Load user when API with id route parameter is hit */
router.param('id', userController.load);

export default router;
