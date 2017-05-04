import express from 'express';
import dataController from '../controllers/data.controller';

const router = express.Router(); // eslint-disable-line new-cap

/**
 * @api {post} /data/clean Clean the data
 * @apiName Clean the data
 * @apiGroup Data
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": "data cleared successfully"
 *     }
 *
 */
router.route('/clean')
  .post(dataController.clean);

/**
 * @api {post} /data/create Create the data
 * @apiName Create the data
 * @apiGroup Data
 *
 * @apiParam {Number} total Number of records to create.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": "data created successfully"
 *     }
 *
 */
router.route('/create')
  .post(dataController.create);

export default router;
