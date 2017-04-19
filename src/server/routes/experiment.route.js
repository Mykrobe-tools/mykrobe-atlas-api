import express from 'express';
import expressJwt from 'express-jwt';
import validate from 'express-validation';
import multer from 'multer';
import paramValidation from '../../config/param-validation';
import experimentController from '../controllers/experiment.controller';
import userController from '../controllers/user.controller';
import config from '../../config/env';

const upload = multer({ dest: 'tmp/' });
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
  .get(expressJwt({ secret: config.jwtSecret }), experimentController.list)
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
        validate(paramValidation.createExperiment),
        userController.loadCurrentUser,
        experimentController.create);

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
       experimentController.get)
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
  .put(expressJwt({ secret: config.jwtSecret }), experimentController.update)
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
  .delete(expressJwt({ secret: config.jwtSecret }), experimentController.remove);
router.route('/:id/metadata')
  /**
   * @api {put} /experiments/:id/metadata Upload metadata
   *
   * @apiName Upload metadata
   * @apiGroup Experiments
   * @apiUse Header
   *
   * @apiParam {String} id The experiment ID.
   * @apiParam {Object} metadata The experiment metadata.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *   {
   *     "status":"success",
   *     "data":{
   *         "metadata":{
   *           "patientId":"12345",
   *           "siteId":"abc",
   *           "genderAtBirth":"Male",
   *           "countryOfBirth":"UK",
   *           "bmi":12,
   *           "injectingDrugUse":"notice",
   *           "homeless":"Yes",
   *           "imprisoned":"Yes",
   *           "smoker":"No",
   *           "diabetic":"Yes",
   *           "hivStatus":"Negative",
   *           "art":"hum",
   *           "labId":"1q2w3er",
   *           "isolateId":"r45w5633",
   *           "collectionDate":"2017-04-21T00:00:00.000Z",
   *           "prospectiveIsolate":true,
   *           "patientAge":34,
   *           "countryIsolate":"branch",
   *           "cityIsolate":"copper",
   *           "dateArrived":"2017-04-21T00:00:00.000Z",
   *           "anatomicalOrigin":"neat",
   *           "smear":"decisive",
   *           "wgsPlatform":"ill",
   *           "wgsPlatformOther":"educated",
   *           "otherGenotypeInformation":false,
   *           "genexpert":"tenuous",
   *           "hain":"truck",
   *           "hainRif":"drain",
   *           "hainInh":"bore",
   *           "hainFl":"island",
   *           "hainAm":"resonant",
   *           "hainEth":"try",
   *           "phenotypeInformationFirstLineDrugs":false,
   *           "phenotypeInformationOtherDrugs":false,
   *           "previousTbinformation":true,
   *           "recentMdrTb":"boy",
   *           "priorTreatmentDate":"2002-05-21T00:00:00.000Z",
   *           "tbProphylaxis":"fetch",
   *           "tbProphylaxisDate":"2014-02-12T00:00:00.000Z",
   *           "currentTbinformation":true,
   *           "startProgrammaticTreatment":false,
   *           "intensiveStartDate":"2018-03-24T00:00:00.000Z",
   *           "intensiveStopDate":"2018-03-25T00:00:00.000Z",
   *           "startProgrammaticContinuationTreatment":"spot",
   *           "continuationStartDate":"2018-03-21T00:00:00.000Z",
   *           "continuationStopDate":"2016-04-21T00:00:00.000Z",
   *           "nonStandardTreatment":"classy",
   *           "sputumSmearConversion":"shade",
   *           "sputumCultureConversion":"bed",
   *           "whoOutcomeCategory":"bird",
   *           "dateOfDeath":"2017-04-21T00:00:00.000Z",
   *           "id":"58e649c9136ed0100330f5eb"
   *         },
   *         "organisation":{
   *           "name":"Apex Entertainment"
   *         },
   *         "location":{
   *           "name":"London",
   *           "lat":3.4,
   *           "lng":-2.3,
   *           "id":"58e649c8136ed0100330f5e6"
   *         },
   *         "collected":"2017-04-17T00:00:00.000Z",
   *         "uploaded":"2017-04-20T00:00:00.000Z",
   *         "jaccardIndex":{
   *           "analysed":"2017-04-20T00:00:00.000Z",
   *           "engine":"",
   *           "version":"1.0",
   *           "experiments":[],
   *           "id":"58e649c8136ed0100330f5e5"
   *       },
   *         "snpDistance":{
   *           "analysed":"2017-04-21T00:00:00.000Z",
   *           "engine":"",
   *           "version":"1.1",
   *           "experiments":[],
   *           "id":"58e649c8136ed0100330f5e4"
   *         },
   *         "geoDistance":{
   *           "analysed":"2017-04-22T00:00:00.000Z",
   *           "engine":"",
   *           "version":"1.2",
   *           "experiments":[],
   *           "id":"58e649c8136ed0100330f5e3"
   *         },
   *         "id":"58e649c8136ed0100330f5e2"
   *     }
   *   }
   *
   */
  .put(expressJwt({ secret: config.jwtSecret }), experimentController.updateMetadata);
router.route('/:id/file')
  /**
   * @api {put} /experiments/:id/file Upload sequence file
   *
   * @apiName Upload sequence file
   * @apiGroup Experiments
   * @apiUse Header
   *
   * @apiParam {String} id The experiment ID.
   * @apiParam {Buffer} files The file to upload.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *   {
   *     "status":"success",
   *     "data":{
   *       "complete":true,
   *       "message":"Chunk 1 uploaded",
   *       "filename":"333-08.json",
   *       "originalFilename":"251726-333-08json",
   *       "identifier":"251726-333-08json"
   *    }
   *  }
   *
   */
  .put(validate(paramValidation.uploadFile),
       expressJwt({ secret: config.jwtSecret }),
       upload.single('files'),
       experimentController.uploadFile);
/** Load user when API with id route parameter is hit */
router.param('id', experimentController.load);

export default router;
