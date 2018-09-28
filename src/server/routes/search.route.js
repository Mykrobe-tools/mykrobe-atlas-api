import express from "express";
import searchController from "../controllers/search.controller";

const router = express.Router();

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
