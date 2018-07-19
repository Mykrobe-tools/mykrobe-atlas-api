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
 *           id:
 *             type: string
 *           created:
 *             type: string
 *             format: date-time
 *           modified:
 *             type: string
 *             format: date-time
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
 *           metadata:
 *             type: object
 *             properties:
 *               patient:
 *                 type: object
 *                 properties:
 *                   patientId:
 *                     type: string
 *                   siteId:
 *                     type: string
 *                   genderAtBirth:
 *                     type: string
 *                   countryOfBirth:
 *                     type: string
 *                   age:
 *                     type: number
 *                   bmi:
 *                     type: number
 *                   injectingDrugUse:
 *                     type: string
 *                   homeless:
 *                     type: string
 *                   imprisoned:
 *                     type: string
 *                   smoker:
 *                     type: string
 *                   diabetic:
 *                     type: string
 *                   hivStatus:
 *                     type: string
 *                   art:
 *                     type: string
 *               sample:
 *                 type: object
 *                 properties:
 *                   labId:
 *                     type: string
 *                   isolateId:
 *                     type: string
 *                   collectionDate:
 *                     type: string
 *                     format: date-time
 *                   prospectiveIsolate:
 *                     type: boolean
 *                   countryIsolate:
 *                     type: string
 *                   cityIsolate:
 *                     type: string
 *                   dateArrived:
 *                     type: string
 *                     format: date-time
 *                   anatomicalOrigin:
 *                     type: string
 *                   smear:
 *                     type: string
 *               genotyping:
 *                 type: object
 *                 properties:
 *                   wgsPlatform:
 *                     type: string
 *                     enum: ["HiSeq", "MiSeq", "NextSeq", "Other"]
 *                   wgsPlatformOther:
 *                     type: string
 *                   otherGenotypeInformation:
 *                     type: string
 *                     enum: ["Yes", "No"]
 *                   genexpert:
 *                     type: string
 *                     enum: ["RIF sensitive", "RIF resistant", "RIF inconclusive", "Not tested"]
 *                   hain:
 *                     type: string
 *                     enum: ["INH/RIF test","Fluoroquinolone/aminoglycoside/ethambutol test","Both","Not tested"]
 *                   hainRif:
 *                     type: string
 *                     enum: ["RIF sensitive", "RIF resistant", "RIF inconclusive", "Not tested"]
 *                   hainInh:
 *                     type: string
 *                     enum: ["INH sensitive", "INH resistant", "INH inconclusive", "Not tested"]
 *                   hainFl:
 *                     type: string
 *                     enum: ["FL sensitive", "FL resistant", "FL inconclusive", "Not tested"]
 *                   hainAm:
 *                     type: string
 *                     enum: ["AM sensitive", "AM resistant", "AM inconclusive", "Not tested"]
 *                   hainEth:
 *                     type: string
 *                     enum: ["ETH sensitive", "ETH resistant", "ETH inconclusive", "Not tested"]
 *               phenotyping:
 *                 type: object
 *                 properties:
 *                   phenotypeInformationFirstLineDrugs:
 *                      type: string
 *                      enum: ["Yes", "No"]
 *                   rifampicin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   ethambutol:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   pyrazinamide:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   isoniazid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   phenotypeInformationOtherDrugs:
 *                      type: string
 *                      enum: ["Yes", "No"]
 *                   rifabutin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   ofloxacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   ciprofloxacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   levofloxacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   gatifloxacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   amikacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   kanamycin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   gentamicin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   streptomycin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   capreomycin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   clofazimine:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   pas:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   linezolid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   ethionamideProthionamide:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   rerizidone:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   amoxicilinClavulanate:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   thioacetazone:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   imipenemImipenemcilastatin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   meropenem:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   clarythromycin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   highDoseIsoniazid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   bedaquiline:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   delamanid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   prothionamide:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   pretothionamide:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *                   pretomanid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: "string"
 *                          enum: ["Sensitive", "Resistant", "Inconclusive", "Not tested"]
 *                        method:
 *                          type: "string"
 *                          enum: ["MGIT", "LJ", "Microtitre plate", "MODS", "Other", "Not known"]
 *               treatment:
 *                 type: object
 *                 properties:
 *                   previousTbinformation:
 *                     type: boolean
 *                   recentMdrTb:
 *                     type: string
 *                   priorTreatmentDate:
 *                     type: string
 *                     format: date-time
 *                   tbProphylaxis:
 *                     type: string
 *                   tbProphylaxisDate:
 *                     type: string
 *                     format: date-time
 *                   currentTbinformation:
 *                     type: boolean
 *                   startProgrammaticTreatment:
 *                     type: boolean
 *                   intensiveStartDate:
 *                     type: string
 *                     format: date-time
 *                   intensiveStopDate:
 *                     type: string
 *                     format: date-time
 *                   startProgrammaticContinuationTreatment:
 *                     type: string
 *                   continuationStartDate:
 *                     type: string
 *                     format: date-time
 *                   continuationStopDate:
 *                     type: string
 *                     format: date-time
 *                   nonStandardTreatment:
 *                     type: string
 *                   sputumSmearConversion:
 *                     type: string
 *                   sputumCultureConversion:
 *                     type: string
 *               outcome:
 *                 type: object
 *                 properties:
 *                   whoOutcomeCategory:
 *                     type: string
 *                   dateOfDeath:
 *                     type: string
 *                     format: date-time
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
 *   ChoicesResponse:
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
  .route("/choices")
  /**
   * @swagger
   * /experiments/choices:
   *   get:
   *     tags:
   *       - Experiments
   *     description: Get choice values for experiements
   *     operationId: experimentsChoices
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: query
   *         name: metadata.genotyping.wgsPlatform
   *         type: string
   *         description: The sample sequencing platform
   *       - in: query
   *         name: metadata.outcome.whoOutcomeCategory
   *         type: string
   *         description: The WHO outcome category
   *       - in: query
   *         name: metadata.patient.countryOfBirth
   *         type: string
   *         description: The country the patient was born in
   *       - in: query
   *         name: metadata.patient.diabetic
   *         type: string
   *         enum: ["Diet alone", "Tablets", "Insulin", "Insulin+tablets", "Not known"]
   *         description: Whether the patient is diabetic
   *       - in: query
   *         name: metadata.patient.genderAtBirth
   *         type: string
   *         enum: ["Male", "Female", "Other or Intersex", "Not known / unavailable"]
   *         description: The patient's gender when born
   *       - in: query
   *         name: metadata.patient.hivStatus
   *         type: string
   *         enum: ["Tested, negative", "Tested, positive", "Not tested", "Not known"]
   *         description: The patient's HIV status
   *       - in: query
   *         name: metadata.patient.homeless
   *         type: string
   *         enum: ["Yes", "No"]
   *         description: Whether the patient is homeless
   *       - in: query
   *         name: metadata.patient.imprisoned
   *         type: string
   *         enum: ["Yes", "No"]
   *         description: Whether the patient is in prison
   *       - in: query
   *         name: metadata.patient.injectingDrugUse
   *         type: string
   *         enum: ["Yes", "No"]
   *         description: Whether the patient injects drugs
   *       - in: query
   *         name: metadata.patient.smoker
   *         type: string
   *         enum: ["Yes", "No"]
   *         description: Whether the patient smokes
   *       - in: query
   *         name: metadata.sample.anatomicalOrigin
   *         type: string
   *         description: Where the sample was taken from
   *       - in: query
   *         name: metadata.sample.countryIsolate
   *         type: string
   *         description: Which country the sample was collected in
   *     responses:
   *       200:
   *         description: Experiments choices
   *         schema:
   *           $ref: '#/definitions/ChoicesResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(keycloak.connect.protect(), experimentController.choices);

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
   *     parameters:
   *       - in: query
   *         name: metadata.genotyping.wgsPlatform
   *         type: string
   *         description: The sample sequencing platform
   *       - in: query
   *         name: metadata.outcome.whoOutcomeCategory
   *         type: string
   *         description: The WHO outcome category
   *       - in: query
   *         name: metadata.patient.countryOfBirth
   *         type: string
   *         description: The country the patient was born in
   *       - in: query
   *         name: metadata.patient.diabetic
   *         type: string
   *         enum: ["Diet alone", "Tablets", "Insulin", "Insulin+tablets", "Not known"]
   *         description: Whether the patient is diabetic
   *       - in: query
   *         name: metadata.patient.genderAtBirth
   *         type: string
   *         enum: ["Male", "Female", "Other or Intersex", "Not known / unavailable"]
   *         description: The patient's gender when born
   *       - in: query
   *         name: metadata.patient.hivStatus
   *         type: string
   *         enum: ["Tested, negative", "Tested, positive", "Not tested", "Not known"]
   *         description: The patient's HIV status
   *       - in: query
   *         name: metadata.patient.homeless
   *         type: string
   *         enum: ["Yes", "No"]
   *         description: Whether the patient is homeless
   *       - in: query
   *         name: metadata.patient.imprisoned
   *         type: string
   *         enum: ["Yes", "No"]
   *         description: Whether the patient is in prison
   *       - in: query
   *         name: metadata.patient.injectingDrugUse
   *         type: string
   *         enum: ["Yes", "No"]
   *         description: Whether the patient injects drugs
   *       - in: query
   *         name: metadata.patient.smoker
   *         type: string
   *         enum: ["Yes", "No"]
   *         description: Whether the patient smokes
   *       - in: query
   *         name: metadata.sample.anatomicalOrigin
   *         type: string
   *         description: Where the sample was taken from
   *       - in: query
   *         name: metadata.sample.countryIsolate
   *         type: string
   *         description: Which country the sample was collected in
   *       - in: query
   *         name: page
   *         type: number
   *         description: The page to return
   *       - in: query
   *         name: per
   *         type: number
   *         description: The total results per page
   *       - in: query
   *         name: sort
   *         type: string
   *         description: The field to sort by
   *       - in: query
   *         name: order
   *         type: string
   *         enum: [asc, desc]
   *         description: The ordering type
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
  .put(keycloak.connect.protect(), experimentController.metadata);
router
  .route("/:id/result")
  /**
   * @swagger
   * /experiments/{id}/result:
   *   post:
   *     tags:
   *       - Experiments
   *     description: Save the result of analysis
   *     operationId: experimentResults
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         type: string
   *         description: The experiment id
   *       - in: body
   *         name: results
   *         description: The experiment results
   *         schema:
   *           type: object
   *     responses:
   *       200:
   *         description: Experiment data
   *         schema:
   *           $ref: '#/definitions/ExperimentResponse'
   */
  .post(experimentController.result);
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
/** Load user when API with id route parameter is hit */
router.param("id", experimentController.load);

export default router;
