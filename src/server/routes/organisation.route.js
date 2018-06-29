import express from "express";
import AccountsHelper from "../helpers/AccountsHelper";
import organisationController from "../controllers/organisation.controller";
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
 *           template:
 *             type: string
 *           id:
 *             type: string
 *     example:
 *       status: success
 *       data:
 *         name: Apex Entertainment
 *         template: Apex template
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
 *             template:
 *               type: string
 *             id:
 *               type: string
 *     example:
 *       status: success
 *       data:
 *         - name: Apex Entertainment
 *           template: Apex template
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
   *     parameters:
   *       - in: body
   *         name: organisation
   *         description: The organisation data
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             template:
   *               type: string
   *           example:
   *             firstname: Apex Entertainment
   *             lastname: Apex template
   *     responses:
   *       200:
   *         description: Organisation data
   *         schema:
   *           $ref: '#/definitions/OrganisationResponse'
   */
  .post(keycloak.connect.protect(), organisationController.create);

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
   *             template:
   *               type: string
   *           example:
   *             name: Apex Entertainment
   *             template: Apex template
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

/** Load user when API with id route parameter is hit */
router.param("id", organisationController.load);

export default router;
