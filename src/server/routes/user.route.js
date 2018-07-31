import express from "express";
import AccountsHelper from "../helpers/AccountsHelper";
import userController from "../controllers/user.controller";
import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();

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
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .get(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    userController.events
  );

export default router;
