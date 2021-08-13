import express from "express";
import swaggerParser from "swagger-parser";
import userRoutes from "./user.route";
import usersRoutes from "./users.route";
import authRoutes from "./auth.route";
import experimentRoutes from "./experiment.route";
import organisationRoutes from "./organisation.route";
import dataRoutes from "./data.route";
import searchRoutes from "./search.route";
import groupRoutes from "./group.route";
import invitationRoutes from "./invitation.route";
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
 * definitions:
 *   ValidationErrorResponse:
 *     properties:
 *       status:
 *         type: string
 *       code:
 *         type: string
 *       message:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           errors:
 *             type: object
 *             properties:
 *               field1:
 *                 type: object
 *                 properties:
 *                   path:
 *                     type: string
 *                   message:
 *                     type: string
 *               field2:
 *                 type: object
 *                 properties:
 *                   path:
 *                     type: string
 *                   message:
 *                     type: string
 *               field3:
 *                 type: object
 *                 properties:
 *                   path:
 *                     type: string
 *                   message:
 *                     type: string
 *     example:
 *       status: success
 *       code: ValidationError
 *       message: Failed to update model
 *       data:
 *         errors:
 *           properties:
 *              path: properties
 *              message: should have required property 'properties'
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
    res.jsend.error(e);
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

// mount searches routes at /searches
router.use("/searches", searchRoutes);

// mount data routes at /data
router.use("/data", dataRoutes);

// mount group routes at /groups
router.use("/groups", groupRoutes);

// mount invitation routes at /invitations
router.use("/invitations", invitationRoutes);

export default router;
