import express from "express";
import searchController from "../controllers/search.controller";

const router = express.Router();

/**
 * @swagger
 * definitions:
 *   SearchResultResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           type:
 *             type: string
 *           user:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               keycloakId:
 *                 type: string
 *               id:
 *                 type: string
 *           bigsi:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               seq:
 *                 type: string
 *               threshold:
 *                 type: number
 *           result:
 *             type: object
 *           id:
 *             type: string
 *     example:
 *       status: success
 *       data:
 *         type: sequence
 *         user:
 *           firstname: John
 *           lastname: Doe
 *           email: john@nhs.co.uk
 *           keycloakId: 80405136-4a04-4df6-8b23-d16d97f7d99e
 *           id: 5b8d19173470371d9e49811d
 *         bigsi:
 *           type: sequence
 *           seq: CAGTCCGTTTGTTCT
 *           threshold: 0.9
 *         result:
 *           type: sequence
 *           received: 2018-09-19T09:17:14.565Z
 *           result:
 *             5b98dc2068650b0d588ff560:
 *               percent_kmers_found: 100
 *             5b98dc2068650b0d588ff55f:
 *               percent_kmers_found: 90
 *             5b98dc2068650b0d588ff55d:
 *               percent_kmers_found: 100
 *         id: 588624076182796462cb133e
 */

router
  .route("/:id/results")
  /**
   * @swagger
   * /searches/{id}/results:
   *   put:
   *     tags:
   *       - Searches
   *     description: Save a search result
   *     operationId: saveSearchResult
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The search id
   *       - in: body
   *         name: result
   *         description: The result object
   *         schema:
   *           type: object
   *           example:
   *             type: sequence
   *             result:
   *               5b98dc2068650b0d588ff560:
   *                 percent_kmers_found: 100
   *               5b98dc2068650b0d588ff55f:
   *                 percent_kmers_found: 90
   *               5b98dc2068650b0d588ff55d:
   *                 percent_kmers_found: 100
   *             query:
   *               seq: CTTGTGGCGAGTGTTGC
   *               threshold: 0.8
   *     responses:
   *       200:
   *         description: Search Result data
   *         schema:
   *           $ref: '#/definitions/SearchResultResponse'
   */
  .put(searchController.saveResult);

/** Load user when API with id route parameter is hit */
router.param("id", searchController.load);

export default router;
