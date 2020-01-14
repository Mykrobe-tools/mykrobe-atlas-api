import express from "express";
import errors from "errors";

import { jsonschema, request } from "makeandship-api-common/lib/modules/express/middleware";
import * as schemas from "mykrobe-atlas-jsonschema";

import AccountsHelper from "../helpers/AccountsHelper";
import OrganisationHelper from "../helpers/OrganisationHelper";

import organisationController from "../controllers/organisation.controller";
import userController from "../controllers/user.controller";
import config from "../../config/env";
import Constants from "../Constants";

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
  .put(
    keycloak.connect.protect(),
    request.whitelist(Constants.ORGANISATION_WHITELIST_FIELDS),
    organisationController.update
  )
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
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .post(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    OrganisationHelper.checkInLists(["unapprovedMembers", "rejectedMembers", "members"]),
    organisationController.join
  );

router
  .route("/:id/members/:memberId/approve")
  /**
   * @swagger
   * /organisations/{id}/members/{memberId}/approve:
   *   post:
   *     tags:
   *       - Organisations
   *     description: Approve a join organisation request
   *     operationId: approveJoinOrganisationRequest
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
   *       - in: path
   *         name: memberId
   *         required: true
   *         type: string
   *         description: The member id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .post(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    OrganisationHelper.isOwner(),
    OrganisationHelper.checkInLists(["members"]),
    OrganisationHelper.checkNotInLists(["unapprovedMembers", "rejectedMembers"]),
    organisationController.approve
  );

router
  .route("/:id/members/:memberId/reject")
  /**
   * @swagger
   * /organisations/{id}/members/{memberId}/reject:
   *   post:
   *     tags:
   *       - Organisations
   *     description: Reject a join organisation request
   *     operationId: rejectJoinOrganisationRequest
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
   *       - in: path
   *         name: memberId
   *         required: true
   *         type: string
   *         description: The member id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .post(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    OrganisationHelper.isOwner(),
    OrganisationHelper.checkInLists(["members", "rejectedMembers"]),
    OrganisationHelper.checkNotInLists(["unapprovedMembers"]),
    organisationController.reject
  );

router
  .route("/:id/members/:memberId/remove")
  /**
   * @swagger
   * /organisations/{id}/members/{memberId}/remove:
   *   post:
   *     tags:
   *       - Organisations
   *     description: Remove an organisation member
   *     operationId: removeOrganisationMember
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
   *       - in: path
   *         name: memberId
   *         required: true
   *         type: string
   *         description: The member id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .post(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    OrganisationHelper.isOwner(),
    OrganisationHelper.checkNotInLists(["members"]),
    organisationController.removeMember
  );

router
  .route("/:id/members/:memberId/promote")
  /**
   * @swagger
   * /organisations/{id}/members/{memberId}/promote:
   *   post:
   *     tags:
   *       - Organisations
   *     description: Promote an organisation member
   *     operationId: promoteOrganisationMember
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
   *       - in: path
   *         name: memberId
   *         required: true
   *         type: string
   *         description: The member id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .post(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    OrganisationHelper.isOwner(),
    OrganisationHelper.checkNotInLists(["members"]),
    organisationController.promote
  );

router
  .route("/:id/owners/:memberId/demote")
  /**
   * @swagger
   * /organisations/{id}/owners/{memberId}/demote:
   *   post:
   *     tags:
   *       - Organisations
   *     description: Demote an organisation owner
   *     operationId: demoteOrganisationOwner
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
   *       - in: path
   *         name: memberId
   *         required: true
   *         type: string
   *         description: The owner id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .post(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    OrganisationHelper.isOwner(),
    OrganisationHelper.checkNotInLists(["owners"]),
    OrganisationHelper.checkEmptyList("owners"),
    organisationController.demote
  );

/** Load user when API with id route parameter is hit */
router.param("id", organisationController.load);

export default router;
