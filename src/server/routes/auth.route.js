import express from "express";
import validate from "express-validation";
import expressJwt from "express-jwt";
import paramValidation from "../../config/param-validation";
import authController from "../controllers/auth.controller";
import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap

/**
 * @swagger
 * definitions:
 *   UserResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           firstname:
 *             type: string
 *           lastname:
 *             type: string
 *           phone:
 *             type: string
 *           email:
 *             type: string
 *           avatar:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                 width:
 *                   type: string
 *                 height:
 *                   type: string
 *                 id:
 *                   type: string
 *           id:
 *             type: string
 *     example:
 *       status: success
 *       data:
 *         firstname: John
 *         lastname: Kitting
 *         phone: 07686833972
 *         email: john@nhs.co.uk
 *         avatar:
 *           - id: 59084b7505a2440a6ed57152
 *             url: https://host/user/avatar/ryg0cpHyb-128.png
 *             width: 128
 *             height: 128
 *           - id: 59084b7505a2440a6ed57151
 *             url: https://host/user/avatar/ryg0cpHyb-256.png
 *             width: 256
 *             height: 256
 *           - id: 59084b7505a2440a6ed57150
 *             url: https://host/user/avatar/ryg0cpHyb-512.png
 *             width: 512
 *             height: 512
 *         id: 588624076182796462cb133e
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Authenticate a user
 *     operationId: authLogin
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The user credentials
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *           example:
 *             email: mark@makeandship.com
 *             password: password
 *     responses:
 *       200:
 *         description: A successful authentication
 *         schema:
 *           $ref: '#/definitions/UserResponse'
 *       401:
 *         description: Failed authentication
 */
router
  .route("/login")
  .post(validate(paramValidation.login), authController.login);

/**
 * @swagger
 * definitions:
 *   ProtectedRouteResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           user:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               iat:
 *                 type: number
 *           num:
 *             type: number
 *     example:
 *       status: success
 *       data:
 *         user:
 *           id: 58e2681949a0461733d01c0b
 *           iat: 1491293225
 *         num: 3.1234455666
 */
/**
 * @swagger
 * /auth/random-number:
 *   get:
 *     tags:
 *       - Authentication
 *     description: A protected route
 *     operationId: authRandomNumber
 *     produces:
 *       - application/json
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: A successful authentication
 *         schema:
 *           $ref: '#/definitions/ProtectedRouteResponse'
 *       401:
 *         description: Failed authentication
 */
router
  .route("/random-number")
  .get(
    expressJwt({ secret: config.jwtSecret }),
    authController.getRandomNumber
  );
/**
 * @swagger
 * /auth/forgot:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Forgot password
 *     operationId: authForgot
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The user email
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties:
 *             email:
 *               type: string
 *           example:
 *             email: mark@makeandship.com
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router
  .route("/forgot")
  .post(validate(paramValidation.forgotPassword), authController.forgot);

/**
 * @swagger
 * /auth/reset:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Reset password
 *     operationId: authReset
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The user token
 *         schema:
 *           type: object
 *           required:
 *             - resetPasswordToken
 *             - password
 *           properties:
 *             resetPasswordToken:
 *               type: string
 *             password:
 *               type: string
 *           example:
 *             resetPasswordToken: GciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *             password: password
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
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
 * @swagger
 * /auth/verify:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Verify account
 *     operationId: authVerify
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The user token
 *         schema:
 *           type: object
 *           required:
 *             - verificationToken
 *           properties:
 *             verificationToken:
 *               type: string
 *           example:
 *             verificationToken: GciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/UserResponse'
 */
router
  .route("/verify")
  .post(validate(paramValidation.verifyAccount), authController.verify);

/**
 * @swagger
 * /auth/resend:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Resend verification email
 *     operationId: authResend
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: email
 *         description: The user email
 *         schema:
 *           type: object
 *           required:
 *             - email
 *           properties:
 *             email:
 *               type: string
 *           example:
 *             email: john@nhs.co.uk
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router
  .route("/resend")
  .post(validate(paramValidation.resendNotification), authController.resend);

export default router;
