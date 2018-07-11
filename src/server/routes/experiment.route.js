import express from "express";
import validate from "express-validation";
import multer from "multer";
import AccountsHelper from "../helpers/AccountsHelper";
import paramValidation from "../../config/param-validation";
import experimentController from "../controllers/experiment.controller";
import userController from "../controllers/user.controller";
import config from "../../config/env";

const upload = multer({ dest: "tmp/" });
const router = express.Router(); // eslint-disable-line new-cap
const keycloak = AccountsHelper.keycloakInstance();

/**
 * @swagger
 * definitions:
 *   ExperimentResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           owner:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               id:
 *                 type: string
 *           organisation:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               template:
 *                 type: string
 *           location:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *           collected:
 *             type: string
 *             format: date-time
 *           uploaded:
 *             type: string
 *             format: date-time
 *           jaccardIndex:
 *             type: object
 *             properties:
 *               analysed:
 *                 type: string
 *                 format: date-time
 *               engine:
 *                 type: string
 *               version:
 *                 type: string
 *           snpDistance:
 *             type: object
 *             properties:
 *               analysed:
 *                 type: string
 *                 format: date-time
 *               engine:
 *                 type: string
 *               version:
 *                 type: string
 *           geoDistance:
 *             type: object
 *             properties:
 *               analysed:
 *                 type: string
 *                 format: date-time
 *               engine:
 *                 type: string
 *               version:
 *                 type: string
 *           metadata:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: string
 *               siteId:
 *                 type: string
 *               genderAtBirth:
 *                 type: string
 *               countryOfBirth:
 *                 type: string
 *               bmi:
 *                 type: number
 *               injectingDrugUse:
 *                 type: string
 *               homeless:
 *                 type: string
 *               imprisoned:
 *                 type: string
 *               smoker:
 *                 type: string
 *               diabetic:
 *                 type: string
 *               hivStatus:
 *                 type: string
 *               art:
 *                 type: string
 *               labId:
 *                 type: string
 *               isolateId:
 *                 type: string
 *               collectionDate:
 *                 type: string
 *                 format: date-time
 *               prospectiveIsolate:
 *                 type: boolean
 *               patientAge:
 *                 type: number
 *               countryIsolate:
 *                 type: string
 *               cityIsolate:
 *                 type: string
 *               dateArrived:
 *                 type: string
 *                 format: date-time
 *               anatomicalOrigin:
 *                 type: string
 *               smear:
 *                 type: string
 *               wgsPlatform:
 *                 type: string
 *               wgsPlatformOther:
 *                 type: string
 *               otherGenotypeInformation:
 *                 type: boolean
 *               genexpert:
 *                 type: string
 *               hain:
 *                 type: string
 *               hainRif:
 *                 type: string
 *               hainInh:
 *                 type: string
 *               hainFl:
 *                 type: string
 *               hainAm:
 *                 type: string
 *               hainEth:
 *                 type: string
 *               phenotypeInformationFirstLineDrugs:
 *                 type: boolean
 *               phenotypeInformationOtherDrugs:
 *                 type: boolean
 *               previousTbinformation:
 *                 type: boolean
 *               recentMdrTb:
 *                 type: string
 *               priorTreatmentDate:
 *                 type: string
 *                 format: date-time
 *               tbProphylaxis:
 *                 type: string
 *               tbProphylaxisDate:
 *                 type: string
 *                 format: date-time
 *               currentTbinformation:
 *                 type: boolean
 *               startProgrammaticTreatment:
 *                 type: boolean
 *               intensiveStartDate:
 *                 type: string
 *                 format: date-time
 *               intensiveStopDate:
 *                 type: string
 *                 format: date-time
 *               startProgrammaticContinuationTreatment:
 *                 type: string
 *               continuationStartDate:
 *                 type: string
 *                 format: date-time
 *               continuationStopDate:
 *                 type: string
 *                 format: date-time
 *               nonStandardTreatment:
 *                 type: string
 *               sputumSmearConversion:
 *                 type: string
 *               sputumCultureConversion:
 *                 type: string
 *               whoOutcomeCategory:
 *                 type: string
 *               dateOfDeath:
 *                 type: string
 *                 format: date-time
 *               id:
 *                 type: string
 *           id:
 *             type: string
 *     example:
 *       status: success
 *       data:
 *         owner:
 *           firstname: Sean
 *           lastname: Leavy
 *           phone: +44 7968 716851
 *           email: sean@gmail.com
 *         organisation:
 *           name: Apex Entertainment
 *           template: Apex template
 *         location:
 *           name: London
 *           lat: 3.4
 *           lng: 3.4
 *           id: 58e4c7526555100f447d50ef
 *         collected: 2017-04-17T00:00:00.000Z
 *         uploaded: 2017-04-20T00:00:00.000Z
 *         jaccardIndex:
 *           analysed: 2017-04-20T00:00:00.000Z
 *           engine: [engine]
 *           version: 1.0
 *           id: 58e4c7526555100f447d50ee
 *         snpDistance:
 *           analysed: 2017-04-22T00:00:00.000Z
 *           engine: [engine]
 *           version: 1.0
 *           id: 58e4c7526555100f447d50ee
 *         geoDistance:
 *           analysed: 2017-04-22T00:00:00.000Z
 *           engine: [engine]
 *           version: 1.0
 *           id: 58e4c7526555100f447d50ee
 *         id: 588624076182796462cb133e
 */
/**
 * @swagger
 * definitions:
 *   ListExperimentsResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             owner:
 *               type: object
 *               properties:
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 id:
 *                   type: string
 *             organisation:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 template:
 *                   type: string
 *             location:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 lat:
 *                   type: number
 *                 lng:
 *                   type: number
 *             collected:
 *               type: string
 *               format: date-time
 *             uploaded:
 *               type: string
 *               format: date-time
 *             jaccardIndex:
 *               type: object
 *               properties:
 *                 analysed:
 *                   type: string
 *                   format: date-time
 *                 engine:
 *                   type: string
 *                 version:
 *                   type: string
 *             snpDistance:
 *               type: object
 *               properties:
 *                 analysed:
 *                   type: string
 *                   format: date-time
 *                 engine:
 *                   type: string
 *                 version:
 *                   type: string
 *             geoDistance:
 *               type: object
 *               properties:
 *                 analysed:
 *                   type: string
 *                   format: date-time
 *                 engine:
 *                   type: string
 *                 version:
 *                   type: string
 *             id:
 *               type: string
 *     example:
 *       status: success
 *       data:
 *         - owner:
 *             firstname: Sean
 *             lastname: Leavy
 *             phone: +44 7968 716851
 *             email: sean@gmail.com
 *           organisation:
 *             name: Apex Entertainment
 *             template: Apex template
 *           location:
 *             name: London
 *             lat: 3.4
 *             lng: 3.4
 *             id: 58e4c7526555100f447d50ef
 *           collected: 2017-04-17T00:00:00.000Z
 *           uploaded: 2017-04-20T00:00:00.000Z
 *           jaccardIndex:
 *             analysed: 2017-04-20T00:00:00.000Z
 *             engine: [engine]
 *             version: 1.0
 *             id: 58e4c7526555100f447d50ee
 *           snpDistance:
 *             analysed: 2017-04-22T00:00:00.000Z
 *             engine: [engine]
 *             version: 1.0
 *             id: 58e4c7526555100f447d50ee
 *           geoDistance:
 *             analysed: 2017-04-22T00:00:00.000Z
 *             engine: [engine]
 *             version: 1.0
 *             id: 58e4c7526555100f447d50ee
 *           id: 588624076182796462cb133e
 */
/**
 * @swagger
 * definitions:
 *   SearchExperimentsResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           summary:
 *             type: object
 *             properties:
 *               hits:
 *                 type: number
 *           results:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 owner:
 *                   type: object
 *                   properties:
 *                     firstname:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     id:
 *                       type: string
 *                 organisation:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     template:
 *                       type: string
 *                 location:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *                 collected:
 *                   type: string
 *                   format: date-time
 *                 uploaded:
 *                   type: string
 *                   format: date-time
 *                 jaccardIndex:
 *                   type: object
 *                   properties:
 *                     analysed:
 *                       type: string
 *                       format: date-time
 *                     engine:
 *                       type: string
 *                     version:
 *                       type: string
 *                 snpDistance:
 *                   type: object
 *                   properties:
 *                     analysed:
 *                       type: string
 *                       format: date-time
 *                     engine:
 *                       type: string
 *                     version:
 *                       type: string
 *                 geoDistance:
 *                   type: object
 *                   properties:
 *                     analysed:
 *                       type: string
 *                       format: date-time
 *                     engine:
 *                       type: string
 *                     version:
 *                      type: string
 *                 id:
 *                   type: string
 *     example:
 *       status: success
 *       data:
 *         summary:
 *           hits: 5
 *         results:
 *           - owner:
 *               firstname: Sean
 *               lastname: Leavy
 *               phone: +44 7968 716851
 *               email: sean@gmail.com
 *             organisation:
 *               name: Apex Entertainment
 *               template: Apex template
 *             location:
 *               name: London
 *               lat: 3.4
 *               lng: 3.4
 *               id: 58e4c7526555100f447d50ef
 *             collected: 2017-04-17T00:00:00.000Z
 *             uploaded: 2017-04-20T00:00:00.000Z
 *             jaccardIndex:
 *               analysed: 2017-04-20T00:00:00.000Z
 *               engine: [engine]
 *               version: 1.0
 *               id: 58e4c7526555100f447d50ee
 *             snpDistance:
 *               analysed: 2017-04-22T00:00:00.000Z
 *               engine: [engine]
 *               version: 1.0
 *               id: 58e4c7526555100f447d50ee
 *             geoDistance:
 *               analysed: 2017-04-22T00:00:00.000Z
 *               engine: [engine]
 *               version: 1.0
 *               id: 58e4c7526555100f447d50ee
 *             id: 588624076182796462cb133e
 */
/**
 * @swagger
 * definitions:
 *   MetadataChoicesResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           field1:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 count:
 *                   type: integer
 *           field2:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 count:
 *                   type: integer
 *           field3:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 count:
 *                   type: integer
 *           field4:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 count:
 *                   type: integer
 *           field5:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 count:
 *                   type: integer
 *           range1:
 *             type: object
 *             properties:
 *               min:
 *                 type: integer
 *               max:
 *                 type: integer
 *           range2:
 *             type: object
 *             properties:
 *               min:
 *                 type: string
 *               max:
 *                 type: string
 *     example:
 *       status: success
 *       data:
 *         metadata.priorTreatmentDate:
 *           min: 2018-04-03T14:03:00.036Z
 *           max: 2018-05-03T12:09:57.322Z
 *         metadata.patientAge:
 *           min: 4
 *           max: 63
 *         metadata.collectionDate:
 *           min: 2018-04-03T14:03:00.036Z
 *           max: 2018-05-03T12:09:57.322Z
 */
router
  .route("/")
  /**
   * @swagger
   * /experiments:
   *   get:
   *     tags:
   *       - Experiments
   *     description: List all experiments
   *     operationId: experimentsList
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: Experiments list
   *         schema:
   *           $ref: '#/definitions/ListExperimentsResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(keycloak.connect.protect(), experimentController.list)
  /**
   * @swagger
   * /experiments:
   *   post:
   *     tags:
   *       - Experiments
   *     description: Create new experiment
   *     operationId: experimentsCreate
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: experiment
   *         description: The experiment data
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             owner:
   *               type: object
   *               properties:
   *                 firstname:
   *                   type: string
   *                 lastname:
   *                   type: string
   *                 phone:
   *                   type: string
   *                 email:
   *                   type: string
   *             organisation:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                 location:
   *                   type: object
   *                   properties:
   *                     name:
   *                       type: string
   *                     lat:
   *                       type: number
   *                     lng:
   *                       type: number
   *                 collected:
   *                   type: string
   *                   format: date-time
   *                 uploaded:
   *                   type: string
   *                   format: date-time
   *                 jaccardIndex:
   *                   type: object
   *                   properties:
   *                     analysed:
   *                       type: string
   *                       format: date-time
   *                     engine:
   *                       type: string
   *                     version:
   *                       type: string
   *                 snpDistance:
   *                   type: object
   *                   properties:
   *                     analysed:
   *                       type: string
   *                       format: date-time
   *                     engine:
   *                       type: string
   *                     version:
   *                       type: string
   *                 geoDistance:
   *                   type: object
   *                   properties:
   *                     analysed:
   *                       type: string
   *                       format: date-time
   *                     engine:
   *                       type: string
   *                     version:
   *                       type: string
   *           example:
   *             owner:
   *               firstname: Sean
   *               lastname: Leavy
   *               phone: +44 7968 716851
   *               email: sean@gmail.com
   *             organisation:
   *               name: Apex Entertainment
   *               template: Apex template
   *             location:
   *               name: London
   *               lat: 3.4
   *               lng: 3.4
   *             collected: 2017-04-17T00:00:00.000Z
   *             uploaded: 2017-04-20T00:00:00.000Z
   *             jaccardIndex:
   *               analysed: 2017-04-20T00:00:00.000Z
   *               engine: [engine]
   *               version: 1.0
   *             snpDistance:
   *               analysed: 2017-04-22T00:00:00.000Z
   *               engine: [engine]
   *               version: 1.0
   *             geoDistance:
   *               analysed: 2017-04-22T00:00:00.000Z
   *               engine: [engine]
   *               version: 1.0
   *     responses:
   *       200:
   *         description: Experiment data
   *         schema:
   *           $ref: '#/definitions/ExperimentResponse'
   */
  .post(
    keycloak.connect.protect(),
    validate(paramValidation.createExperiment),
    userController.loadCurrentUser,
    experimentController.create
  );
router
  .route("/search")
  /**
   * @swagger
   * /experiments/search:
   *   get:
   *     tags:
   *       - Experiments
   *     description: Search experiments
   *     operationId: experimentsSearch
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: Experiments search
   *         schema:
   *           $ref: '#/definitions/SearchExperimentsResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(
    keycloak.connect.protect(),
    validate(paramValidation.searchExperiment),
    experimentController.search
  );

router
  .route("/:id")
  /**
   * @swagger
   * /experiments/{id}:
   *   get:
   *     tags:
   *       - Experiments
   *     description: Get experiment details
   *     operationId: experimentsGetById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *     responses:
   *       200:
   *         description: Experiment data
   *         schema:
   *           $ref: '#/definitions/ExperimentResponse'
   */
  .get(keycloak.connect.protect(), experimentController.get)
  /**
   * @swagger
   * /experiments/{id}:
   *   put:
   *     tags:
   *       - Experiments
   *     description: Update experiment details
   *     operationId: experimentsUpdateById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *       - in: body
   *         name: experiment
   *         description: The experiment data
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             owner:
   *               type: object
   *               properties:
   *                 firstname:
   *                   type: string
   *                 lastname:
   *                   type: string
   *                 phone:
   *                   type: string
   *                 email:
   *                   type: string
   *             organisation:
   *               type: object
   *               properties:
   *                 location:
   *                   type: object
   *                   properties:
   *                     name:
   *                       type: string
   *                     lat:
   *                       type: number
   *                     lng:
   *                       type: number
   *                 collected:
   *                   type: string
   *                   format: date-time
   *                 uploaded:
   *                   type: string
   *                   format: date-time
   *                 jaccardIndex:
   *                   type: object
   *                   properties:
   *                     analysed:
   *                       type: string
   *                       format: date-time
   *                     engine:
   *                       type: string
   *                     version:
   *                       type: string
   *                 snpDistance:
   *                   type: object
   *                   properties:
   *                     analysed:
   *                       type: string
   *                       format: date-time
   *                     engine:
   *                       type: string
   *                     version:
   *                       type: string
   *                 geoDistance:
   *                   type: object
   *                   properties:
   *                     analysed:
   *                       type: string
   *                       format: date-time
   *                     engine:
   *                       type: string
   *                     version:
   *                       type: string
   *           example:
   *             location:
   *               name: London
   *               lat: 3.4
   *               lng: 3.4
   *             collected: 2017-04-17T00:00:00.000Z
   *             uploaded: 2017-04-20T00:00:00.000Z
   *             jaccardIndex:
   *               analysed: 2017-04-20T00:00:00.000Z
   *               engine: [engine]
   *               version: 1.0
   *             snpDistance:
   *               analysed: 2017-04-22T00:00:00.000Z
   *               engine: [engine]
   *               version: 1.0
   *             geoDistance:
   *               analysed: 2017-04-22T00:00:00.000Z
   *               engine: [engine]
   *               version: 1.0
   *     responses:
   *       200:
   *         description: Experiment data
   *         schema:
   *           $ref: '#/definitions/ExperimentResponse'
   */
  .put(keycloak.connect.protect(), experimentController.update)
  /**
   * @swagger
   * /experiments/{id}:
   *   delete:
   *     tags:
   *       - Experiments
   *     description: Delete an experiment
   *     operationId: experimentsDeleteById
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .delete(keycloak.connect.protect(), experimentController.remove);
router
  .route("/:id/metadata")
  /**
   * @swagger
   * /experiments/{id}/metadata:
   *   put:
   *     tags:
   *       - Experiments
   *     description: Upload experiment metadata
   *     operationId: experimentUpdateMetadata
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *       - in: body
   *         name: metadata
   *         description: The experiment metadata
   *         schema:
   *           type: object
   *     responses:
   *       200:
   *         description: Experiment data
   *         schema:
   *           $ref: '#/definitions/ExperimentResponse'
   */
  .put(keycloak.connect.protect(), experimentController.updateMetadata);
router
  .route("/:id/file")
  /**
   * @swagger
   * /experiments/{id}/file:
   *   put:
   *     tags:
   *       - Experiments
   *     description: Upload experiment file
   *     operationId: experimentUploadFile
   *     consumes:
   *       - multipart/form-data
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *       - in: formData
   *         name: file
   *         description: The file to upload
   *         type: string
   *         format: binary
   *         required: true
   *     responses:
   *       200:
   *         description: Successful response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .put(
    keycloak.connect.protect(),
    validate(paramValidation.uploadFile),
    upload.single("file"),
    experimentController.uploadFile
  )
  /**
   * @swagger
   * /experiments/{id}/file:
   *   get:
   *     tags:
   *       - Experiments
   *     description: View sequence file
   *     operationId: viewSequenceFile
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *     responses:
   *       200:
   *         description: Successful response
   *         schema:
   *           type: string
   *           format: binary
   *       401:
   *         description: Failed authentication
   */
  .get(keycloak.connect.protect(), experimentController.readFile);
router
  .route("/:id/provider")
  /**
   * @swagger
   * /experiments/{id}/provider:
   *   put:
   *     tags:
   *       - Experiments
   *     description: Upload a file via a 3rd party provider
   *     operationId: experimentProviderUpload
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *       - in: body
   *         name: file
   *         description: Description of the file to retrieve from a 3rd party provider
   *         schema:
   *           type: object
   *           properties:
   *             name:
   *               type: string
   *             path:
   *               type: string
   *             provider:
   *               type: string
   *             accessToken:
   *               type: string
   *               description: Use when provider is Google
   *     responses:
   *       200:
   *         description: Successful response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .put(
    keycloak.connect.protect(),
    validate(paramValidation.uploadFile),
    upload.single("file"),
    experimentController.uploadFile
  );
router
  .route("/:id/upload-status")
  /**
   * @swagger
   * /experiments/{id}/upload-status:
   *   get:
   *     tags:
   *       - Experiments
   *     description: Resumable upload status
   *     operationId: uploadStatus
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .get(keycloak.connect.protect(), experimentController.uploadStatus);
router
  .route("/reindex")
  /**
   * @swagger
   * /experiments/reindex:
   *   post:
   *     tags:
   *       - Experiments
   *     description: Reindex all experiments
   *     operationId: reindexExperiments
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: A jsend response
   *         schema:
   *           $ref: '#/definitions/BasicResponse'
   */
  .post(keycloak.connect.protect(), experimentController.reindex);
router
  .route("/metadata/choices")
  /**
   * @swagger
   * /experiments/metadata/choices:
   *   get:
   *     tags:
   *       - Experiments
   *     description: Metadata choices
   *     operationId: experimentsMetadataChoices
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: Experiments metadata choices
   *         schema:
   *           $ref: '#/definitions/MetadataChoicesResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(keycloak.connect.protect(), experimentController.choices);
/** Load user when API with id route parameter is hit */
router.param("id", experimentController.load);

export default router;
