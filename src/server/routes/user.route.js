import express from "express";
import AccountsHelper from "../helpers/AccountsHelper";
import userController from "../controllers/user.controller";
import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();
console.log(`keycloak: ${keycloak}`);
console.log(`keycloak.connect: ${JSON.stringify(keycloak.connect, null, 2)}`);
console.log(`keycloak.connect.protect: ${keycloak.connect.protect}`);
console.log(`userController: ${userController}`);
console.log(`userController.loadCurrentUser: ${userController.loadCurrentUser}`);
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
 *   thirdPartyUploadProgressExample:
 *     example:
 *       id: 5b6434fc2656da268e7cac5f
 *       provider: dropbox
 *       complete: 69.15
 *       size: 2080040
 *       totalSize: 3007920
 *       file: MDR.fastq.gz
 *       event: Upload via 3rd party progress
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
 *   thirdPartyUploadCompleteExample:
 *     example:
 *       id: 5b6434fc2656da268e7cac5f
 *       provider: dropbox
 *       complete: 100
 *       size: 3007920
 *       totalSize: 3007920
 *       file: MDR.fastq.gz
 *       event: Upload via 3rd party complete
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
 *       type: predictor
 *       results:
 *         - type: predictor
 *           received: 2018-08-03T10:17:40.626Z
 *       event: Analysis complete
 */

/**
 * @swagger
 * definitions:
 *   UserEventsResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           userId:
 *             type: string
 *           openUploads:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 identifier:
 *                   type: string
 *                 chunkNumber:
 *                   type: string
 *                 totalChunks:
 *                   type: string
 *                 chunkSize:
 *                   type: integer
 *                 totalSize:
 *                   type: integer
 *                 filename:
 *                   type: string
 *                 originalFilename:
 *                   type: string
 *                 type:
 *                   type: string
 *                 checksum:
 *                   type: string
 *                 chunkFilename:
 *                   type: string
 *                 complete:
 *                   type: boolean
 *                 verifiedTotalChunks:
 *                   type: integer
 *                 percentageComplete:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 provider:
 *                   type: string
 *                 size:
 *                   type: integer
 *                 fileLocation:
 *                   type: string
 *           openSearches:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 bigsi:
 *                   type: object
 *                   properties:
 *                     query:
 *                       type: object
 *                       properties:
 *                         gene:
 *                           type: string
 *                         ref:
 *                           type: string
 *                         pos:
 *                           type: integer
 *                         alt:
 *                           type: string
 *                 type:
 *                   type: string
 *                 status:
 *                   type: string
 *                 expires:
 *                   type: string
 *                   format: date-time
 *           openAnalysis:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 fileLocation:
 *                   type: string
 *           id:
 *             type: string
 *     example:
 *       status: success
 *       data:
 *         userId: 5b8d19173470371d9e49811d
 *         openUploads:
 *           - id: 5b98dc2068650b0d588ff560
 *             provider: dropbox
 *             size: 1423244
 *             fileLocation: /tmp/files/upload/filename.zip
 *             percentageComplete: 25
 *         openSearches:
 *           - id: 5b98dc2068650b0d588ff55f
 *             bigsi:
 *               query:
 *                 gene: rpoB
 *                 ref: S
 *                 pos: 405
 *                 alt: L
 *             type:
 *             status: pending
 *             expires: 2019-12-19T09:17:14.565Z
 *         openAnalysis:
 *           - id: 5b98dc2068650b0d588ff55d
 *             fileLocation: /tmp/files/upload/analysis.zip
 *         id: 588624076182796462cb133e
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
  .get(keycloak.connect.protect(), userController.loadCurrentUser, userController.get)
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
  .put(keycloak.connect.protect(), userController.loadCurrentUser, userController.update)
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
  .delete(keycloak.connect.protect(), userController.loadCurrentUser, userController.remove);

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
   *           thirdPartyProgressExample:
   *             $ref: '#/definitions/thirdPartyUploadProgressExample'
   *           uploadCompleteExample:
   *             $ref: '#/definitions/uploadCompleteExample'
   *           thirdPartyCompleteExample:
   *             $ref: '#/definitions/thirdPartyUploadCompleteExample'
   *           analysisStartedExample:
   *             $ref: '#/definitions/analysisStartedExample'
   *           analysisCompleteExample:
   *             $ref: '#/definitions/analysisCompleteExample'
   */
  .get(keycloak.connect.protect(), userController.loadCurrentUser, userController.events);

router
  .route("/events/status")
  /**
   * @swagger
   * /user/events/status:
   *   get:
   *     tags:
   *       - User
   *     description: Notification State
   *     operationId: userEventsStatus
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/UserEventsResponse'
   */
  .get(keycloak.connect.protect(), userController.loadCurrentUser, userController.eventsStatus);

export default router;
