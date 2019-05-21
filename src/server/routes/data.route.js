import express from "express";
import dataController from "../controllers/data.controller";
import AccountsHelper from "../helpers/AccountsHelper";

const router = express.Router(); // eslint-disable-line new-cap
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
 * /data/demo/{folder}:
 *   post:
 *     tags:
 *       - Data
 *     description: Load Demo Data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: folder
 *         required: true
 *         type: string
 *         description: The folder name to load from
 *       - in: body
 *         name: purge
 *         description: A flag to purge existing experiments
 *         schema:
 *           type: object
 *           properties:
 *             purge:
 *               type: boolean
 *           example:
 *             purge: true
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router.route("/demo/:folder").post(keycloak.connect.protect(), dataController.loadDemo);

export default router;
