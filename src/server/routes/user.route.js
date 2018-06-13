import express from "express";
import expressJwt from "express-jwt";
import userController from "../controllers/user.controller";
import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap

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
    expressJwt({ secret: config.jwtSecret }),
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
   *       401:
   *         description: Failed authentication
   */
  .put(
    expressJwt({ secret: config.jwtSecret }),
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
    expressJwt({ secret: config.jwtSecret }),
    userController.loadCurrentUser,
    userController.remove
  );

export default router;
