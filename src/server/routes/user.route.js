import express from "express";
import AccountsHelper from "../helpers/AccountsHelper";
import userController from "../controllers/user.controller";
import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();

/**
 * @swagger
 * definitions:
 *   uploadProgressExample:
 *     example:
 *       id: 5b6434fc2656da268e7cac5f
 *       complete: 99.52
 *       count: 206
 *       total: 207
 *       file: MDR.fastq.gz
 *       event: Upload progress
 */
/**
 * @swagger
 * definitions:
 *   uploadCompleteExample:
 *     example:
 *       id: 5b6434fc2656da268e7cac5f
 *       complete: 100
 *       count: 207
 *       total: 207
 *       file: MDR.fastq.gz
 *       event: Upload complete
 */
/**
 * @swagger
 * definitions:
 *   analysisStartedExample:
 *     example:
 *       id: 5b6434fc2656da268e7cac5f
 *       taskId: e986f350-970b-11e8-8b76-7d2b3faf02cf
 *       file: MDR.fastq.gz
 *       event: Analysis started
 */
/**
 * @swagger
 * definitions:
 *   analysisCompleteExample:
 *     example:
 *       id: 5b6434fc2656da268e7cac5f
 *       taskId: e986f350-970b-11e8-8b76-7d2b3faf02cf
 *       file: MDR.fastq.gz
 *       results:
 *         - type: predictor
 *           received: 2018-08-03T10:17:40.626Z
 *       event: Analysis complete
 */
router
  .route("/")
  /**
   * @swagger
   * /user:
   *   get:
   *     tags:
   *       - Current User
   *     description: Get current user details
   *     operationId: currentUserGet
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: User details
   *         schema:
   *           $ref: '#/definitions/UserResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    userController.get
  )
  /**
   * @swagger
   * /user:
   *   put:
   *     tags:
   *       - Current User
   *     description: Update current user details
   *     operationId: currentUserUpdate
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: user
   *         description: The user data
   *         schema:
   *           type: object
   *           properties:
   *             firstname:
   *               type: string
   *             lastname:
   *               type: string
   *             phone:
   *               type: string
   *             email:
   *               type: string
   *           example:
   *             firstname: mark
   *             lastname: thomsit
   *             phone: 07686833972
   *             email: mark@makeandship.com
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: User details
   *         schema:
   *           $ref: '#/definitions/UserResponse'
   *       500:
   *         description: Validation Failed
   *         schema:
   *           $ref: '#/definitions/ValidationErrorResponse'
   *       401:
   *         description: Failed authentication
   */
  .put(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    userController.update
  )
  /**
   * @swagger
   * /user:
   *   delete:
   *     tags:
   *       - Current User
   *     description: Deletes the current user account
   *     operationId: currentUserDelete
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .delete(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    userController.remove
  );

router
  .route("/events")
  /**
   * @swagger
   * /user/events:
   *   get:
   *     tags:
   *       - User
   *     description: User events
   *     operationId: userEvents
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: A jsend response
   *         examples:
   *           uploadProgressExample:
   *             $ref: '#/definitions/uploadProgressExample'
   *           uploadCompleteExample:
   *             $ref: '#/definitions/uploadCompleteExample'
   *           analysisStartedExample:
   *             $ref: '#/definitions/analysisStartedExample'
   *           analysisCompleteExample:
   *             $ref: '#/definitions/analysisCompleteExample'
   */
  .get(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    userController.events
  );

export default router;
