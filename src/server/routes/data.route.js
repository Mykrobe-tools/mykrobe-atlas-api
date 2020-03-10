import express from "express";
import multer from "multer";
import dataController from "../controllers/data.controller";
import AccountsHelper from "../helpers/AccountsHelper";

const router = express.Router(); // eslint-disable-line new-cap
const upload = multer({ dest: "tmp/" });
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
 * /data/demo:
 *   post:
 *     tags:
 *       - Data
 *     description: Load Demo Data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: file
 *         description: The csv file name
 *         schema:
 *           type: object
 *           properties:
 *             file:
 *               type: string
 *               format: binary
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router
  .route("/demo")
  .post(keycloak.connect.protect(), upload.single("file"), dataController.loadDemo);

export default router;
