import express from "express";

import invitationController from "../controllers/invitation.controller";
import userController from "../controllers/user.controller";

import AccountsHelper from "../helpers/AccountsHelper";

const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();

router
  .route("/:id/accept")
  /**
   * @swagger
   * /invitations/{id}/accept:
   *   get:
   *     tags:
   *       - Invitations
   *     description: Accept invitation
   *     operationId: acceptInvitation
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The invitation id
   *     responses:
   *       200:
   *         description: User data
   *         schema:
   *           $ref: '#/definitions/UserResponse'
   */
  .put(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    invitationController.load,
    invitationController.accept
  );

router
  .route("/:id/reject")
  /**
   * @swagger
   * /invitations/{id}/reject:
   *   get:
   *     tags:
   *       - Invitations
   *     description: Reject invitation
   *     operationId: rejectInvitation
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The invitation id
   *     responses:
   *       200:
   *         description: User data
   *         schema:
   *           $ref: '#/definitions/UserResponse'
   */
  .put(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    invitationController.load,
    invitationController.reject
  );

export default router;
