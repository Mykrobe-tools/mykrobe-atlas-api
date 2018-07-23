import express from "express";
import errors from "errors";
import { jsonschema } from "makeandship-api-common/lib/modules/express/middleware";
import * as schemas from "../../schemas";
import AccountsHelper from "../helpers/AccountsHelper";
import authController from "../controllers/auth.controller";
import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();

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
 *   TokenResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           access_token:
 *             type: string
 *           expires_in:
 *             type: number
 *           refresh_expires_in:
 *             type: number
 *           token_type:
 *             type: string
 *           id_token:
 *             type: string
 *           not-before-policy:
 *             type: number
 *           session_state:
 *             type: string
 *           scope:
 *             type: string
 *         example:
 *           access_token: eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTLUVoTEVSSzl4UXczNWM1QkY2UmFaOUR0Vk9wdTY4ZUVieXZZN1E2OXdvIn0.eyJqdGkiOiI4MjM5Nz
 *           expires_in: 300
 *           refresh_expires_in: 1800
 *           refresh_token: eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTLUVoTEVSSzl4UXczNWM1QkY2UmFaOUR0Vk9wdTY4ZUVieXZZN1E2OXdvIn0.eyJqdGkiOiI0M
 *           token_type: bearer
 *           id_token: eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTLUVoTEVSSzl4UXczNWM1QkY2UmFaOUR0Vk9wdTY4ZUVieXZZN1E2OXdvIn0.eyJqdGki
 *           not-before-policy: 0
 *           session_state: 0573dcdb-3e5d-471d-bdf5-aec830f974e5
 *           scope: [scope]
 *   RefreshErrorResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *           code:
 *             type: string
 *           message:
 *             type: string
 *         example:
 *           status: error
 *           code: Error
 *           message: Request failed
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
 *       500:
 *         description: Validation Failed
 *         schema:
 *           $ref: '#/definitions/ValidationErrorResponse'
 */
router
  .route("/login")
  .post(
    jsonschema.schemaValidation(schemas["login"], errors, "LoginError"),
    authController.login
  );

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
  .get(keycloak.connect.protect(), authController.getRandomNumber);
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
 *       500:
 *         description: Validation Failed
 *         schema:
 *           $ref: '#/definitions/ValidationErrorResponse'
 */
router
  .route("/forgot")
  .post(
    jsonschema.schemaValidation(
      schemas["forgotPassword"],
      errors,
      "ForgotPasswordError"
    ),
    authController.forgot
  );

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
 *       500:
 *         description: Validation Failed
 *         schema:
 *           $ref: '#/definitions/ValidationErrorResponse'
 */
router
  .route("/resend")
  .post(
    jsonschema.schemaValidation(
      schemas["resendNotification"],
      errors,
      "ResendVerificationEmailError"
    ),
    authController.resend
  );

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Refresh the access token
 *     operationId: authAccess
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: credentials
 *         description: The refresk token
 *         schema:
 *           type: object
 *           required:
 *             - refreshToken
 *           properties:
 *             refreshToken:
 *               type: string
 *           example:
 *             refreshToken: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTLUVoTEVSSzl4UXczNWM1QkY2UmFaOUR0Vk9wdTY4ZUVieXZZN1E2OXdvIn0.eyJqdGkiOiIyYThjMzAyNi04YjgzLTQzYjktYjc4ZS1lN2UxOWVmN2E5YzUiLCJleHAiOjE1Mjg4ODE0NjksIm5iZiI6MCwiaWF0IjoxNTI4ODc5NjY5LCJpc3MiOiJodHRwczovL2FjY291bnRzLm1ha2VhbmRzaGlwLmNvbS9hdXRoL3JlYWxtcy9jYXJlcmVwb3J0IiwiYXVkIjoiY2FyZXJlcG9ydC1hcHAiLCJzdWIiOiIzZTExMmM4Ny1mODBjLTQ3MDgtYjdhMi00YzNhZGVhNDYzYzYiLCJ0eXAiOiJSZWZyZXNoIiwiYXpwIjoiY2FyZXJlcG9ydC1hcHAiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI4YzE3YjAyMy0yODlmLTQyYzQtYmZlOC0yNGQwZGVmNjk2YjAiLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19fQ.VHAXysXYbmSnRCFyrrVtigeMLgefKMWRjBPFWE-rAsjfSw3ZDOf7DvEPmYATAR86JPrrU9HLuteci_x4ozw-uEVdAi6q4mm3A9OAAPb8ROQtZ7EmCMYhAihW3s9416lQW3tQUxNWeWhAla8MJxQdZOE0eUwhK6m9WcYqLS95ax003F31nks_M7zvmLM7Omv8eFCvLigx5zTix6KZtGSgNVEzzWrl0iIxEpLZSSUrYBA7m2sAYonaL8XDnKCHgf92SDaRFNe99xyJfV7NC5QKHVqpaNj1AF3l_VDcIoR3bYFAtOLz6aY7y01xfIxfPn3Wk_DGeJ5YzcjVkY_3W5paRQ"
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/TokenResponse'
 *       401:
 *         description: Refresh Failed
 *         schema:
 *           $ref: '#/definitions/RefreshErrorResponse'
 */
router
  .route("/refresh")
  .post(
    jsonschema.schemaValidation(
      schemas["refershToken"],
      errors,
      "RefreshTokenError"
    ),
    authController.refresh
  );

export default router;
