import express from "express";
import validate from "express-validation";
import expressJwt from "express-jwt";
import paramValidation from "../../config/param-validation";
import authController from "../controllers/auth.controller";
import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap

/**
 * @api {post} /auth/login Authenticate a user - Email
 * @apiName Authenticate - Email
 * @apiGroup Authentication
 *
 * @apiParam {String} email Users unique email.
 * @apiParam {String} password Users password.
 *
 * @apiSuccess {String} email email of the User.
 * @apiSuccess {String} token Users unique token.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *            "email": "john@gmail.com",
 *            "token": "GciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
 *            "id": "589dcbe140e9440ed36bb616"
 *         }
 *     }
 *
 * @apiError AuthenticationError Invalid credentials.
 *
 */
router
  .route("/login")
  .post(validate(paramValidation.login), authController.login);

/**
 * @api {get} /auth/random-number A protected route
 * @apiName Random number
 * @apiGroup Authentication
 *
 * @apiHeader {String} token Users unique token.
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer {token}"
 *     }
 *
 * @apiSuccess {String} username Username of the User.
 * @apiSuccess {String} token Users unique token.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *            "user": {
 *                "id": "58e2681949a0461733d01c0b",
 *                "iat": 1491293225
 *              },
 *             "num": 3.1234455666
 *         }
 *     }
 *
 * @apiError Unauthorized Invalid token.
 *
 */
router
  .route("/random-number")
  .get(
    expressJwt({ secret: config.accounts.jwtSecret }),
    authController.getRandomNumber
  );
/**
 * @api {post} /auth/forgot Forgot password
 * @apiName Forgot password
 * @apiGroup Authentication
 * @apiUse NotFound
 *
 * @apiSuccess {String} email email of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": "Email sent successfully to john@gmail.com"
 *     }
 *
 *
 */
router
  .route("/forgot")
  .post(validate(paramValidation.forgotPassword), authController.forgot);

/**
 * @api {post} /auth/reset Reset password
 *
 * @apiName Reset password
 * @apiGroup Authentication
 * @apiUse NotFound
 *
 * @apiParam {String} resetPasswordToken The user unique resetPasswordToken.
 * @apiParam {String} password The user new password.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": "Password was reset successfully for john@nhs.co.uk"
 *     }
 */
router
  .route("/reset")
  .post(validate(paramValidation.resetPassword), authController.reset);
/**
 * @api {post} /auth/verify Authenticate a user - Phone
 * @apiName Authenticate - Phone
 * @apiGroup Authentication
 *
 * @apiParam {String} phone Users unique phone.
 * @apiParam {String} verificationToken Users unique verificationToken.
 *
 * @apiSuccess {String} phone phone of the User.
 * @apiSuccess {String} token Users unique token.
 * @apiSuccess {String} id id of the User.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *            "phone": "+447968700000",
 *            "token": "GciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
 *            "id": "589dcbe140e9440ed36bb616"
 *         }
 *     }
 *
 * @apiError AuthenticationError Invalid credentials.
 *
 */

/**
 * @api {post} /auth/verify Verify account
 *
 * @apiName Verify account
 * @apiGroup Authentication
 * @apiUse NotFound
 *
 * @apiParam {String} verificationToken The user unique verificationToken.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": {
 *         "firstname": "David",
 *         "lastname": "Krool",
 *         "phone": "+44 7968 716851",
 *         "email": "david@gmail.com",
 *         "id": "59099f897120c90b8e1a2365",
 *         "organisation": {
 *           "name": "Apex Entertainment",
 *           "template": "MODS",
 *           "id": "590c2f0ed71d08031b7ca81e"
 *         }
 *       }
 *     }
 */
router
  .route("/verify")
  .post(validate(paramValidation.verifyAccount), authController.verify);

/**
 * @api {post} /auth/resend Resend verification code
 *
 * @apiName Resend verification
 * @apiUse NotFound
 * @apiGroup Authentication
 *
 * @apiParam {String} phone The user unique phone.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *        "status": "success",
 *         "data": "Notification was resent by sms"
 *      }
 */
router
  .route("/resend")
  .post(validate(paramValidation.resendNotification), authController.resend);

export default router;
