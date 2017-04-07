import express from 'express';
import expressJwt from 'express-jwt';
import organisationController from '../controllers/organisation.controller';
import config from '../../config/env';

const router = express.Router(); // eslint-disable-line new-cap


  /**
   * @apiDefine ExperimentResponse
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": {
   *         "owner": {
   *           "firstname": "Sean",
   *           "lastname": "Leavy",
   *           "phone": "+44 7968 716851",
   *           "email": "sean@gmail.com",
   *           "id": "58e2697c87f269174c48cedf"
   *         },
   *         "organisation": {
   *           "name": "Apex Entertainment"
   *         },
   *         "location": {
   *           "name": "London",
   *           "lat": 3.4,
   *           "lng": -2.3,
   *           "id": "58e4c7526555100f447d50ef"
   *         },
   *         "collected": "2017-04-17T00:00:00.000Z",
   *         "uploaded": "2017-04-20T00:00:00.000Z",
   *         "jaccardIndex": {
   *           "analysed": "2017-04-20T00:00:00.000Z",
   *           "engine": "",
   *           "version": "1.0",
   *           "experiments": [],
   *           "id": "58e4c7526555100f447d50ee"
   *         },
   *           "snpDistance": {
   *             "analysed": "2017-04-21T00:00:00.000Z",
   *             "engine": "",
   *             "version": "1.0",
   *             "experiments": [],
   *             "id": "58e4c7526555100f447d50ed"
   *         },
   *           "geoDistance": {
   *             "analysed": "2017-04-22T00:00:00.000Z",
   *             "engine": "",
   *             "version": "1.0",
   *             "experiments": [],
   *             "id": "58e4c7526555100f447d50ec"
   *           },
   *         "id": "58e4c7526555100f447d50eb"
   *       }
   *     }
   */
router.route('/')
  /**
   * @api {get} /experiments Get experiments list
   *
   * @apiName List experiments
   * @apiGroup Experiments
   * @apiUse Header
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": [{
   *         "owner": {
   *           "firstname": "Sean",
   *           "lastname": "Leavy",
   *           "phone": "+44 7968 716851",
   *           "email": "sean@gmail.com",
   *           "id": "58e2697c87f269174c48cedf"
   *         },
   *         "organisation": {
   *           "name": "Apex Entertainment"
   *         },
   *         "location": {
   *           "name": "London",
   *           "lat": 3.4,
   *           "lng": -2.3,
   *           "id": "58e4c7526555100f447d50ef"
   *         },
   *         "collected": "2017-04-17T00:00:00.000Z",
   *         "uploaded": "2017-04-20T00:00:00.000Z",
   *         "jaccardIndex": {
   *           "analysed": "2017-04-20T00:00:00.000Z",
   *           "engine": "",
   *           "version": "1.0",
   *           "experiments": [],
   *           "id": "58e4c7526555100f447d50ee"
   *         },
   *           "snpDistance": {
   *             "analysed": "2017-04-21T00:00:00.000Z",
   *             "engine": "",
   *             "version": "1.0",
   *             "experiments": [],
   *             "id": "58e4c7526555100f447d50ed"
   *         },
   *           "geoDistance": {
   *             "analysed": "2017-04-22T00:00:00.000Z",
   *             "engine": "",
   *             "version": "1.0",
   *             "experiments": [],
   *             "id": "58e4c7526555100f447d50ec"
   *           },
   *         "id": "58e4c7526555100f447d50eb"
   *       }]
   *     }
   */
  .get(expressJwt({ secret: config.jwtSecret }),
       organisationController.list)
  /**
   * @api {post} /experiments Create new experiment
   *
   * @apiName Create new experiment
   * @apiGroup Experiments
   * @apiUse Header
   * @apiUse ExperimentResponse
   *
   * @apiParam {Object} organisation The experiment organisation.
   * @apiParam {String} organisation.name The name of organisation.
   * @apiParam {Object} location The experiment location.
   * @apiParam {String} location.name The location name.
   * @apiParam {Number} location.lat The location lat.
   * @apiParam {Number} location.lng The location lng.
   * @apiParam {Date} collected The collection date.
   * @apiParam {Date} uploaded The upload date.
   * @apiParam {Object} jaccardIndex The experiment jaccardIndex.
   * @apiParam {Date} jaccardIndex.analysed The analysis date.
   * @apiParam {String} jaccardIndex.engine The engine.
   * @apiParam {String} jaccardIndex.version The version.
   * @apiParam {Array} jaccardIndex.experiments The experiments.
   * @apiParam {Object} snpDistance The experiment snpDistance.
   * @apiParam {Date} snpDistance.analysed The analysis date.
   * @apiParam {String} snpDistance.engine The engine.
   * @apiParam {String} snpDistance.version The version.
   * @apiParam {Array} snpDistance.experiments The experiments.
   * @apiParam {Object} geoDistance The experiment geoDistance.
   * @apiParam {Date} geoDistance.analysed The analysis date.
   * @apiParam {String} geoDistance.engine The engine.
   * @apiParam {String} geoDistance.version The version.
   * @apiParam {Array} geoDistance.experiments The experiments.
   *
   */
  .post(expressJwt({ secret: config.jwtSecret }),
       organisationController.create);

router.route('/:id')
  /**
   * @api {get} /experiments/:id Read an experiment
   *
   * @apiName Read experiment
   * @apiGroup Experiments
   * @apiUse Header
   * @apiUse ExperimentResponse
   *
   * @apiParam {String} id The experiment ID.
   *
   */
  .get(expressJwt({ secret: config.jwtSecret }),
       organisationController.get)
  /**
   * @api {put} /experiments/:id Update existing experiment
   *
   * @apiName Update experiment
   * @apiGroup Experiments
   * @apiUse Header
   * @apiUse ExperimentResponse
   *
   * @apiParam {String} id The experiment ID.
   * @apiParam {Object} organisation The experiment organisation.
   * @apiParam {String} organisation.name The name of organisation.
   * @apiParam {Object} location The experiment location.
   * @apiParam {String} location.name The location name.
   * @apiParam {Number} location.lat The location lat.
   * @apiParam {Number} location.lng The location lng.
   * @apiParam {Date} collected The collection date.
   * @apiParam {Date} uploaded The upload date.
   * @apiParam {Object} jaccardIndex The experiment jaccardIndex.
   * @apiParam {Date} jaccardIndex.analysed The analysis date.
   * @apiParam {String} jaccardIndex.engine The engine.
   * @apiParam {String} jaccardIndex.version The version.
   * @apiParam {Array} jaccardIndex.experiments The experiments.
   * @apiParam {Object} snpDistance The experiment snpDistance.
   * @apiParam {Date} snpDistance.analysed The analysis date.
   * @apiParam {String} snpDistance.engine The engine.
   * @apiParam {String} snpDistance.version The version.
   * @apiParam {Array} snpDistance.experiments The experiments.
   * @apiParam {Object} geoDistance The experiment geoDistance.
   * @apiParam {Date} geoDistance.analysed The analysis date.
   * @apiParam {String} geoDistance.engine The engine.
   * @apiParam {String} geoDistance.version The version.
   * @apiParam {Array} geoDistance.experiments The experiments.
   *
   */
  .put(expressJwt({ secret: config.jwtSecret }),
       organisationController.update)
  /**
   * @api {delete} /experiments/:id Delete existing experiment
   *
   * @apiName Delete experiment
   * @apiGroup Experiments
   * @apiUse Header
   *
   * @apiParam {String} id The experiment ID.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": "Experiment was successfully deleted."
   *     }
   *
   */
  .delete(expressJwt({ secret: config.jwtSecret }),
       organisationController.remove);

/** Load user when API with id route parameter is hit */
router.param('id', organisationController.load);

export default router;
