import express from "express";
import dataController from "../controllers/data.controller";

const router = express.Router(); // eslint-disable-line new-cap

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

export default router;
