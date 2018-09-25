import express from "express";
import AccountsHelper from "../helpers/AccountsHelper";
import searchController from "../controllers/search.controller";

const router = express.Router();
const keycloak = AccountsHelper.keycloakInstance();

router
  .route("/:id/results")
  .put(keycloak.connect.protect(), searchController.saveResult);

/** Load user when API with id route parameter is hit */
router.param("id", searchController.load);

export default router;
