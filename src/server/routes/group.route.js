import express from "express";
import { jsonschema, request } from "makeandship-api-common/lib/modules/express/middleware";
import * as schemas from "mykrobe-atlas-jsonschema";
import groupController from "../controllers/group.controller";
import AccountsHelper from "../helpers/AccountsHelper";

const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();
/**
 * @swagger
 * definitions:
 *   GroupResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           annotation:
 *             type: string
 *           searchHash:
 *             type: string
 *           experiments:
 *             type: array
 *           searchQuery:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               bigsi:
 *                 type: object
 *                 properties:
 *                   seq:
 *                     type: string
 *                   threshold:
 *                     type: number
 *                   ref:
 *                     type: string
 *                   alt:
 *                     type: string
 *                   pos:
 *                     type: number
 *                   gene:
 *                     type: string
 *           id:
 *             type: string
 *     example:
 *       status: success
 *       data:
 *         name: Mendoza Group
 *         annotation: Lorem ipsum
 *         searchQuery:
 *           type: sequence
 *           bigsi:
 *             query:
 *               seq: GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA
 *               threshold: 0.9
 *         id: 588624076182796462cb133e
 */
/**
 * @swagger
 * definitions:
 *   ListGroupsResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             annotation:
 *               type: string
 *             searchHash:
 *               type: string
 *             experiments:
 *               type: array
 *             searchQuery:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                 bigsi:
 *                   type: object
 *                   properties:
 *                     seq:
 *                       type: string
 *                     threshold:
 *                       type: number
 *                     ref:
 *                       type: string
 *                     alt:
 *                       type: string
 *                     pos:
 *                       type: number
 *                     gene:
 *                       type: string
 *             id:
 *               type: string
 *     example:
 *       status: success
 *       data:
 *         - name: Mendoza Group
 *           annotation: Lorem ipsum
 *           searchQuery:
 *             type: sequence
 *             bigsi:
 *               query:
 *                 seq: GTCAGTCCGTTTGTTCTTGTGGCGAGTGTAGTA
 *                 threshold: 0.9
 *           id: 588624076182796462cb133e
 */

router
  .route("/")
  /**
   * @swagger
   * /groups:
   *   post:
   *     tags:
   *       - Groups
   *     description: Create new group
   *     operationId: groupsCreate
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: body
   *         name: group
   *         description: The group data
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             annotation:
   *               type: string
   *           example:
   *             name: Mendoza Group
   *             annotation: Lorem ipsum
   *     responses:
   *       200:
   *         description: Group data
   *         schema:
   *           $ref: '#/definitions/GroupResponse'
   */
  .post(
    keycloak.connect.protect(),
    jsonschema.schemaValidation(schemas["group"]),
    groupController.create
  )
  /**
   * @swagger
   * /groups:
   *   get:
   *     tags:
   *       - Groups
   *     description: List all groups
   *     operationId: groupsList
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: Groups list
   *         schema:
   *           $ref: '#/definitions/ListGroupsResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(keycloak.connect.protect(), groupController.list);

router
  .route("/:id")
  /**
   * @swagger
   * /groups/{id}:
   *   put:
   *     tags:
   *       - Groups
   *     description: Update group details
   *     operationId: groupsUpdateById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The group id
   *       - in: body
   *         name: group
   *         description: The group data
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *           example:
   *             name: Mendoza Group
   *     responses:
   *       200:
   *         description: Group data
   *         schema:
   *           $ref: '#/definitions/GroupResponse'
   */
  .put(keycloak.connect.protect(), groupController.update)
  /**
   * @swagger
   * /groups/{id}:
   *   get:
   *     tags:
   *       - Groups
   *     description: Get group details
   *     operationId: groupsGetById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The group id
   *     responses:
   *       200:
   *         description: Group data
   *         schema:
   *           $ref: '#/definitions/GroupResponse'
   */
  .get(keycloak.connect.protect(), groupController.get)
  /**
   * @swagger
   * /groups/{id}:
   *   delete:
   *     tags:
   *       - Groups
   *     description: Delete a group
   *     operationId: groupsDeleteById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The group id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .delete(keycloak.connect.protect(), groupController.remove);

/**
 * @swagger
 * /groups/search:
 *   post:
 *     tags:
 *       - Groups
 *     description: Trigger search for all groups
 *     operationId: groupsSearch
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router.route("/search").post(groupController.search);

/**
 * @swagger
 * /groups/{id}/search:
 *   post:
 *     tags:
 *       - Groups
 *     description: Trigger search for a group
 *     operationId: groupSearch
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: The group id
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router.route("/:id/search").post(groupController.search);

/** Load user when API with id route parameter is hit */
router.param("id", groupController.load);

export default router;
