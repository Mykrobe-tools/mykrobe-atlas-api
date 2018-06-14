import express from "express";
import validate from "express-validation";
import expressJwt from "express-jwt";
import paramValidation from "../../config/param-validation";
import userController from "../controllers/user.controller";
import config from "../../config/env";
import jwt from "../../config/jwt";

const router = express.Router(); // eslint-disable-line new-cap

router
  .route("/")
  /**
   * @swagger
   * definitions:
   *   ListUsersResponse:
   *     properties:
   *       status:
   *         type: string
   *       data:
   *         type: array
   *         items:
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
   *             avatar:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   url:
   *                     type: string
   *                   width:
   *                     type: string
   *                   height:
   *                     type: string
   *                   id:
   *                     type: string
   *             id:
   *               type: string
   *     example:
   *       status: success
   *       data:
   *         - firstname: John
   *           lastname: Kitting
   *           phone: 07686833972
   *           email: john@nhs.co.uk
   *           avatar:
   *             - id: 59084b7505a2440a6ed57152
   *               url: https://host/user/avatar/ryg0cpHyb-128.png
   *               width: 128
   *               height: 128
   *             - id: 59084b7505a2440a6ed57151
   *               url: https://host/user/avatar/ryg0cpHyb-256.png
   *               width: 256
   *               height: 256
   *             - id: 59084b7505a2440a6ed57150
   *               url: https://host/user/avatar/ryg0cpHyb-512.png
   *               width: 512
   *               height: 512
   *           id: 588624076182796462cb133e
   */

  /**
   * @swagger
   * /users:
   *   get:
   *     tags:
   *       - Users
   *     description: List all users
   *     operationId: usersList
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: Users list
   *         schema:
   *           $ref: '#/definitions/ListUsersResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(expressJwt({ secret: config.accounts.jwtSecret }), userController.list)

  /**
   * @swagger
   * /users:
   *   post:
   *     tags:
   *       - Users
   *     description: Register new user
   *     operationId: usersCreate
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
   *             password:
   *               type: string
   *           example:
   *             firstname: mark
   *             lastname: thomsit
   *             phone: 07686833972
   *             email: mark@makeandship.com
   *             password: password
   *     responses:
   *       200:
   *         description: User data
   *         schema:
   *           $ref: '#/definitions/UserResponse'
   */
  .post(validate(paramValidation.createUser), userController.create);

router
  .route("/:id")
  /**
   * @swagger
   * /users/{id}:
   *   get:
   *     tags:
   *       - Users
   *     description: Get user details
   *     operationId: usersGetById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The user id
   *     responses:
   *       200:
   *         description: User data
   *         schema:
   *           $ref: '#/definitions/UserResponse'
   */
  .get(expressJwt({ secret: config.accounts.jwtSecret }), userController.get)

  /**
   * @swagger
   * /users/{id}:
   *   put:
   *     tags:
   *       - Users
   *     description: Update user details
   *     operationId: usersUpdateById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The user id
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
   *     responses:
   *       200:
   *         description: User data
   *         schema:
   *           $ref: '#/definitions/UserResponse'
   */
  .put(
    expressJwt({ secret: config.accounts.jwtSecret }),
    validate(paramValidation.updateUser),
    userController.update
  )

  /**
   * @swagger
   * /users/{id}:
   *   delete:
   *     tags:
   *       - Users
   *     description: Delete a user
   *     operationId: usersDeleteById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The user id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .delete(
    expressJwt({ secret: config.accounts.jwtSecret }),
    userController.remove
  );

router
  .route("/:id/role")
  /**
   * @swagger
   * /users/{id}/role:
   *   post:
   *     tags:
   *       - Users
   *     description: Assign staff role
   *     operationId: assignRole
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The user id
   *     responses:
   *       200:
   *         description: User data
   *         schema:
   *           $ref: '#/definitions/UserResponse'
   */
  .post(
    expressJwt({ secret: config.accounts.jwtSecret }),
    jwt.checkPermission(config.accounts.adminRole),
    userController.assignRole
  );

/** Load user when API with id route parameter is hit */
router.param("id", userController.load);

export default router;
