import express from "express";
import expressJwt from "express-jwt";
import userController from "../controllers/user.controller";
//import config from "../../config/env"

const router = express.Router(); // eslint-disable-line new-cap

const config = require("../../config/env");

router
  .route("/")
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
   *                "id": "588624076182796462cb133e",
   *                "organisation": {
   *                  "name": "Apex Entertainment",
   *                  "template": "MODS",
   *                  "id": "590c2f0ed71d08031b7ca81e"
   *                }
   *              }
   *     }
   */
  .get(
    expressJwt({ secret: config.accounts.jwtSecret }),
    userController.loadCurrentUser,
    userController.get
  )
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
  .put(
    expressJwt({ secret: config.accounts.jwtSecret }),
    userController.loadCurrentUser,
    userController.update
  )
  /**
   * @api {delete} /user Delete current user
   *
   * @apiName Delete current user
   * @apiGroup Current User
   * @apiUse Header
   * @apiUse NotFound
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": "Account was successfully deleted."
   *     }
   */
  .delete(
    expressJwt({ secret: config.accounts.jwtSecret }),
    userController.loadCurrentUser,
    userController.remove
  );

export default router;
