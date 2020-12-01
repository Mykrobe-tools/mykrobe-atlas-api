import express from "express";
import multer from "multer";
import dataController from "../controllers/data.controller";
import AccountsHelper from "../helpers/AccountsHelper";

import config from "../../config/env";

const router = express.Router(); // eslint-disable-line new-cap
const upload = multer({ dest: config.express.uploadsTempLocation || "tmp/" });
const keycloak = AccountsHelper.keycloakInstance();
/**
 * @swagger
 * /data/clean:
 *   post:
 *     tags:
 *       - Data
 *     description: Clear fake data (Development only)
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router.route("/clean").post(dataController.clean);

/**
 * @swagger
 * /data/random:
 *   post:
 *     tags:
 *       - Data
 *     description: Create fake data with users and experiments (Development only)
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: total
 *         description: The total records to create
 *         schema:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *           example:
 *             total: 100
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router.route("/create").post(dataController.create);

/**
 * @swagger
 * /data/bulk:
 *   post:
 *     tags:
 *       - Data
 *     description: Load Demo Data
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: file
 *         description: The file to upload
 *         type: string
 *         format: binary
 *         required: true
 *       - in: formData
 *         name: purge
 *         description: A flag to purge existing experiments
 *         type: boolean
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router.route("/bulk").post(keycloak.connect.protect(), upload.single("file"), dataController.bulk);

/**
 * @swagger
 * /data/bulk/metadata:
 *   post:
 *     tags:
 *       - Data
 *     description: Load Metadata
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: file
 *         description: The file to upload
 *         type: string
 *         format: binary
 *         required: true
 *       - in: formData
 *         name: purge
 *         description: A flag to purge existing experiments
 *         type: boolean
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router
  .route("/bulk/metadata")
  .post(keycloak.connect.protect(), upload.single("file"), dataController.bulkMetadata);

export default router;
