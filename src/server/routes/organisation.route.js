import express from "express";
import errors from "errors";

import { jsonschema } from "makeandship-api-common/lib/modules/express/middleware";
import * as schemas from "mykrobe-atlas-jsonschema";

import AccountsHelper from "../helpers/AccountsHelper";
import OrganisationHelper from "../helpers/OrganisationHelper";

import organisationController from "../controllers/organisation.controller";
import userController from "../controllers/user.controller";
import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();

/**
 * @swagger
 * definitions:
 *   OrganisationResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *           slug:
 *             type: string
 *           groupId:
 *             type: string
 *           owners:
 *             type: array
 *           members:
 *             type: array
 *           unapprovedMembers:
 *             type: array
 *           rejectedMembers:
 *             type: array
 *           id:
 *             type: string
 *     example:
 *       status: success
 *       data:
 *         name: Apex Entertainment
 *         slug: apex-entertainment
 *         groupId: a842a3f45-ae66-41c5-b41c-798bc5e47a5b
 *         owners:
 *           - id: 890624089182796462cb1322
 *             firtsname: Sam
 *             lastname: Smith
 *             email: sam@apex.com
 *             username: sam@apex.com
 *         members:
 *           - id: 890624089182796462cb1322
 *             firtsname: Sam
 *             lastname: Smith
 *             email: sam@apex.com
 *             username: sam@apex.com
 *         unapprovedMembers:
 *           - id: 457624089182796462cgr666
 *             firtsname: John
 *             lastname: Thomas
 *             email: john@apex.com
 *             username: john@apex.com
 *         rejectedMembers:
 *           - id: 457624089182796462cy7g66
 *             firtsname: Ali
 *             lastname: Wood
 *             email: ali@apex.com
 *             username: ali@apex.com
 *         id: 588624076182796462cb133e
 */
/**
 * @swagger
 * definitions:
 *   ListOrganisationsResponse:
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
 *             slug:
 *               type: string
 *             groupId:
 *               type: string
 *             owners:
 *               type: array
 *             members:
 *               type: array
 *             unapprovedMembers:
 *               type: array
 *             id:
 *               type: string
 *     example:
 *       status: success
 *       data:
 *         - name: Apex Entertainment
 *           slug: apex-entertainment
 *           groupId: a842a3f45-ae66-41c5-b41c-798bc5e47a5b
 *           owners:
 *             - id: 890624089182796462cb1322
 *               firtsname: Sam
 *               lastname: Smith
 *               email: sam@apex.com
 *               username: sam@apex.com
 *           members:
 *             - id: 890624089182796462cb1322
 *               firtsname: Sam
 *               lastname: Smith
 *               email: sam@apex.com
 *               username: sam@apex.com
 *           unapprovedMembers:
 *             - id: 457624089182796462cgr666
 *               firtsname: John
 *               lastname: Thomas
 *               email: john@apex.com
 *               username: john@apex.com
 *           rejectedMembers:
 *             - id: 457624089182796462cy7g66
 *               firtsname: Ali
 *               lastname: Wood
 *               email: ali@apex.com
 *               username: ali@apex.com
 *           id: 588624076182796462cb133e
 */
router
  .route("/")
  /**
   * @swagger
   * /organisations:
   *   get:
   *     tags:
   *       - Organisations
   *     description: List all organisations
   *     operationId: organisationsList
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: Organisations list
   *         schema:
   *           $ref: '#/definitions/ListOrganisationsResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(keycloak.connect.protect(), organisationController.list)
  /**
   * @swagger
   * /organisations:
   *   post:
   *     tags:
   *       - Organisations
   *     description: Create new organisation
   *     operationId: organisationsCreate
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: body
   *         name: organisation
   *         description: The organisation data
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *           example:
   *             name: Apex Entertainment
   *     responses:
   *       200:
   *         description: Organisation data
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .post(
    keycloak.connect.protect(),
    jsonschema.schemaValidation(schemas["organisation"], errors, "CreateOrganisationError", "all"),
    userController.loadCurrentUser,
    organisationController.create
  );

router
  .route("/:id")
  /**
   * @swagger
   * /organisations/{id}:
   *   get:
   *     tags:
   *       - Organisations
   *     description: Get organisation details
   *     operationId: organisationsGetById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The organisation id
   *     responses:
   *       200:
   *         description: Organisation data
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .get(keycloak.connect.protect(), organisationController.get)
  /**
   * @swagger
   * /organisations/{id}:
   *   put:
   *     tags:
   *       - Organisations
   *     description: Update organisation details
   *     operationId: organisationsUpdateById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The organisation id
   *       - in: body
   *         name: organisation
   *         description: The organisation data
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *           example:
   *             name: Apex Entertainment
   *     responses:
   *       200:
   *         description: Organisation data
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .put(keycloak.connect.protect(), organisationController.update)
  /**
   * @swagger
   * /organisations/{id}:
   *   delete:
   *     tags:
   *       - Organisations
   *     description: Delete an organisation
   *     operationId: organisationsDeleteById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The organisation id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .delete(keycloak.connect.protect(), organisationController.remove);

router
  .route("/:id/join")
  /**
   * @swagger
   * /organisations/{id}/join:
   *   post:
   *     tags:
   *       - Organisations
   *     description: Join an organisation
   *     operationId: joinOrganisation
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The organisation id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .post(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    OrganisationHelper.checkInLists(["unapprovedMembers", "rejectedMembers", "members"]),
    organisationController.join
  );

/** Load user when API with id route parameter is hit */
router.param("id", organisationController.load);

export default router;
