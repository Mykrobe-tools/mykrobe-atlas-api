import express from "express";
import swaggerParser from "swagger-parser";
import userRoutes from "./user.route";
import usersRoutes from "./users.route";
import authRoutes from "./auth.route";
import experimentRoutes from "./experiment.route";
import organisationRoutes from "./organisation.route";
import dataRoutes from "./data.route";
import { swaggerSpec } from "../modules/swagger";

const router = express.Router(); // eslint-disable-line new-cap
/**
 * @swagger
 * definitions:
 *   BasicResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: string
 *     example:
 *       status: success
 *       data: Successful response
 */
/**
 * @swagger
 * /health-check:
 *   get:
 *     tags:
 *       - Health Check
 *     description: Checks the api status
 *     operationId: healthCheck
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: A jsend response
 *         schema:
 *           $ref: '#/definitions/BasicResponse'
 */
router.get("/health-check", (req, res) => res.jsend("OK"));

// serve swagger
router.get("/swagger.json", async (req, res) => {
  try {
    const spec = await swaggerParser.validate(swaggerSpec);
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(spec);
  } catch (e) {
    res.jerror(e);
  }
});

// mount user routes at /users
router.use("/users", usersRoutes);

// mount auth routes at /auth
router.use("/auth", authRoutes);

// mount user routes at /user
router.use("/user", userRoutes);

// mount experiments routes at /experiments
router.use("/experiments", experimentRoutes);

// mount organisations routes at /organisations
router.use("/organisations", organisationRoutes);

// mount data routes at /data
router.use("/data", dataRoutes);

export default router;
