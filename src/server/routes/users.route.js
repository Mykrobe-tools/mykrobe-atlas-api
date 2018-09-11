import express from "express";
import errors from "errors";
import { jsonschema } from "makeandship-api-common/lib/modules/express/middleware";
import * as schemas from "mykrobe-atlas-jsonschema";
import AccountsHelper from "../helpers/AccountsHelper";
import userController from "../controllers/user.controller";
import config from "../../config/env";
import jwt from "../../config/jwt";

const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();

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
   * definitions:
   *   SearchResultResponse:
   *     properties:
   *       status:
   *         type: string
   *       data:
   *         type: object
   *         properties:
   *           type:
   *             type: string
   *           user:
   *             type: object
   *             properties:
   *               firstname:
   *                 type: string
   *               lastname:
   *                 type: string
   *               email:
   *                 type: string
   *               keycloakId:
   *                 type: string
   *               id:
   *                 type: string
   *           bigsi:
   *             type: object
   *             properties:
   *               type:
   *                 type: string
   *               seq:
   *                 type: string
   *               threshold:
   *                 type: number
   *           result:
   *             type: object
   *           id:
   *             type: string
   *     example:
   *       status: success
   *       data:
   *         type: sequence
   *         user:
   *           firstname: John
   *           lastname: Doe
   *           email: john@nhs.co.uk
   *           keycloakId: 80405136-4a04-4df6-8b23-d16d97f7d99e
   *           id: 5b8d19173470371d9e49811d
   *         bigsi:
   *           type: sequence
   *           seq: CAGTCCGTTTGTTCT
   *           threshold: 0.9
   *         result:
   *           ERR017683:
   *             percent_kmers_found: 100
   *           ERR1149371:
   *             percent_kmers_found: 90
   *           ERR1163331:
   *             percent_kmers_found: 100
   *           query:
   *             seq: CAGTCCGTTTGTTCT
   *             threshold: 0.9
   *         id: 588624076182796462cb133e
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
  .get(keycloak.connect.protect(), userController.list)

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
   *       500:
   *         description: Validation Failed
   *         schema:
   *           $ref: '#/definitions/ValidationErrorResponse'
   */
  .post(
    jsonschema.schemaValidation(schemas["register"], errors, "CreateUserError"),
    userController.create
  );

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
  .get(keycloak.connect.protect(), userController.get)

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
  .put(keycloak.connect.protect(), userController.update)

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
  .delete(keycloak.connect.protect(), userController.remove);

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
    keycloak.connect.protect(),
    jwt.checkPermission(config.accounts.adminRole),
    userController.assignRole
  );

router
  .route("/:id/results/:resultId")
  /**
   * @swagger
   * /users/{id}/results/{resultId}:
   *   put:
   *     tags:
   *       - Users
   *     description: Save a search result
   *     operationId: saveSearchResult
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
   *       - in: path
   *         name: resultId
   *         required: true
   *         type: string
   *         description: The result id
   *       - in: body
   *         name: result
   *         description: The result object
   *         schema:
   *           type: object
   *           example:
   *             ERR017683:
   *               percent_kmers_found: 100
   *             ERR1149371:
   *               percent_kmers_found: 90
   *             ERR1163331:
   *               percent_kmers_found: 100
   *     responses:
   *       200:
   *         description: Search Result data
   *         schema:
   *           $ref: '#/definitions/SearchResultResponse'
   */
  .put(keycloak.connect.protect(), userController.saveResults);

/** Load user when API with id route parameter is hit */
router.param("id", userController.load);

/** Load search result when API with resultId route parameter is hit */
router.param("resultId", userController.loadSearchResult);

export default router;
