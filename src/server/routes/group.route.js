import express from "express";
import { jsonschema, request } from "makeandship-api-common/lib/modules/express/middleware";
import * as schemas from "mykrobe-atlas-jsonschema";
import groupController from "../controllers/group.controller";
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
router
  .route("/")
  .post(
    keycloak.connect.protect(),
    jsonschema.schemaValidation(schemas["group"]),
    groupController.create
  )
  .get(keycloak.connect.protect(), groupController.list);

router
  .route("/:id")
  .put(keycloak.connect.protect(), groupController.update)
  .get(keycloak.connect.protect(), groupController.get)
  .delete(keycloak.connect.protect(), groupController.remove);

router.route("/search").post(groupController.search);

router.route("/:id/search").post(groupController.search);

/** Load user when API with id route parameter is hit */
router.param("id", groupController.load);

export default router;
