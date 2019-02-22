import express from "express";
import multer from "multer";
import errors from "errors";
import { jsonschema } from "makeandship-api-common/lib/modules/express/middleware";
import * as schemas from "mykrobe-atlas-jsonschema";
import AccountsHelper from "../helpers/AccountsHelper";
import experimentController from "../controllers/experiment.controller";
import userController from "../controllers/user.controller";
import config from "../../config/env";
import { ownerOnly } from "../modules/security";

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
 *                     enum: [HiSeq, MiSeq, NextSeq, Other]
 *                   wgsPlatformOther:
 *                     type: string
 *                   otherGenotypeInformation:
 *                     type: string
 *                     enum: [Yes, No]
 *                   genexpert:
 *                     type: string
 *                     enum: [RIF sensitive,RIF resistant,RIF inconclusive,Not tested]
 *                   hain:
 *                     type: string
 *                     enum: [INH/RIF test,Fluoroquinolone/aminoglycoside/ethambutol test,Both,Not tested]
 *                   hainRif:
 *                     type: string
 *                     enum: [RIF sensitive, RIF resistant, RIF inconclusive, Not tested]
 *                   hainInh:
 *                     type: string
 *                     enum: [INH sensitive, INH resistant, INH inconclusive, Not tested]
 *                   hainFl:
 *                     type: string
 *                     enum: [FL sensitive, FL resistant, FL inconclusive, Not tested]
 *                   hainAm:
 *                     type: string
 *                     enum: [AM sensitive, AM resistant, AM inconclusive, Not tested]
 *                   hainEth:
 *                     type: string
 *                     enum: [ETH sensitive, ETH resistant, ETH inconclusive, Not tested]
 *               phenotyping:
 *                 type: object
 *                 properties:
 *                   phenotypeInformationFirstLineDrugs:
 *                      type: string
 *                      enum: [Yes, No]
 *                   rifampicin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   ethambutol:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   pyrazinamide:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   isoniazid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   phenotypeInformationOtherDrugs:
 *                      type: string
 *                      enum: [Yes, No]
 *                   rifabutin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   ofloxacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   ciprofloxacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   levofloxacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   gatifloxacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   amikacin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   kanamycin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   gentamicin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   streptomycin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   capreomycin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   clofazimine:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   pas:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   linezolid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   ethionamideProthionamide:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   rerizidone:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   amoxicilinClavulanate:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   thioacetazone:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   imipenemImipenemcilastatin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   meropenem:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   clarythromycin:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   highDoseIsoniazid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   bedaquiline:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   delamanid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   prothionamide:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   pretothionamide:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                   pretomanid:
 *                      type: object
 *                      properties:
 *                        susceptibility:
 *                          type: string
 *                          enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                        method:
 *                          type: string
 *                          enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *               treatment:
 *                 type: object
 *                 properties:
 *                   previousTbinformation:
 *                     type: string
 *                     enum: [Yes, No]
 *                   recentMdrTb:
 *                     type: string
 *                     enum: [Yes,No,Not known]
 *                   priorTreatmentDate:
 *                     type: string
 *                     format: date-time
 *                   tbProphylaxis:
 *                     type: string
 *                     enum: [Yes,No,Not known]
 *                   tbProphylaxisDate:
 *                     type: string
 *                     format: date-time
 *                   currentTbinformation:
 *                     type: string
 *                     enum: [Yes, No]
 *                   startProgrammaticTreatment:
 *                     type: string
 *                     enum: [Yes, No]
 *                   intensiveStartDate:
 *                     type: string
 *                     format: date-time
 *                   intensiveStopDate:
 *                     type: string
 *                     format: date-time
 *                   startProgrammaticContinuationTreatment:
 *                     type: string
 *                     enum: [Yes,No,Not known]
 *                   continuationStartDate:
 *                     type: string
 *                     format: date-time
 *                   continuationStopDate:
 *                     type: string
 *                     format: date-time
 *                   nonStandardTreatment:
 *                     type: string
 *                     enum: [Yes,No,Not known]
 *                   sputumSmearConversion:
 *                     type: string
 *                   sputumCultureConversion:
 *                     type: string
 *                   outsideStandardPhaseRifampicinRifabutin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseEthambutol:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhasePyrazinamide:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseIsoniazid:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseOfloxacin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseMoxifloxacin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseLevofloxacin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseGatifloxacin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseAmikacin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseGentamicin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseStreptomycin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseCapreomycin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseClofazimine:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhasePas:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseLinezolid:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseEthionamideProthionamide:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseTerizidone:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseAmoxicilinClavulanate:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseThioacetazone:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseImipenemImipenemcilastatin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseMeropenem:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseClarythromycin:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *                   outsideStandardPhaseHighDoseIsoniazid:
 *                     type: object
 *                     properties:
 *                       start:
 *                         type: string
 *                         format: date
 *                       stop:
 *                         type: string
 *                         format: date
 *               outcome:
 *                 type: object
 *                 properties:
 *                   whoOutcomeCategory:
 *                     type: string
 *                   dateOfDeath:
 *                     type: string
 *                     format: date-time
 *           results:
 *             type: object
 *             properties:
 *               predictor:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   analysed:
 *                     type: string
 *                   susceptibility:
 *                     type: object
 *                   phylogenetics:
 *                     type: object
 *                   kmer:
 *                     type: number
 *                   probeSets:
 *                     type: array
 *                     items:
 *                       type: string
 *                   file:
 *                     type: array
 *                     items:
 *                       type: string
 *                   genotypeModel:
 *                     type: string
 *     example:
 *       status: success
 *       data:
 *         id: 588624076182796462cb133e
 *         owner:
 *           firstname: Sean
 *           lastname: Leavy
 *           phone: +44 7968 716851
 *           email: sean@gmail.com
 *         created: 2018-07-19T13:23:18.776Z
 *         modified: 2018-07-19T13:23:18.776Z
 *         metadata:
 *           patient:
 *             patientId: eff2fa6a-9d79-41ab-a307-b620cedf7293
 *             siteId: a2a910e3-25ef-475c-bdf9-f6fe215d949f
 *             genderAtBirth: Male
 *             countryOfBirth: India
 *             age: 43
 *             bmi: 25.3
 *             injectingDrugUse: No
 *             homeless: No
 *             imprisoned: No
 *             smoker: Yes
 *             diabetic: Insulin
 *             hivStatus: Not tested
 *           sample:
 *             labId: d19637ed-e5b4-4ca7-8418-8713646a3359
 *             isolateId: 9c0c00f2-8cb1-4254-bf53-3271f35ce696
 *             collectionDate: 2018-10-19
 *             prospectiveIsolate: Yes
 *             countryIsolate: India
 *             cityIsolate: Mumbai
 *             dateArrived: 2018-09-01
 *             anatomicalOrigin: Respiratory
 *             smear: Not known
 *           genotyping:
 *             wgsPlatform: MiSeq
 *             otherGenotypeInformation: Yes
 *             genexpert: Not tested
 *             hain: INH/RIF test
 *             hainRif: RIF resistant
 *             hainInh: INH sensitive
 *             hainFl: Not tested
 *             hainAm: Not tested
 *             hainEth: Not tested
 *           phenotyping:
 *             phenotypeInformationFirstLineDrugs: Yes
 *             rifampicin:
 *               susceptibility: Resistant
 *               method: Not known
 *             ethambutol:
 *               susceptibility: Sensitive
 *               method: Not known
 *             pyrazinamide:
 *               susceptibility: Sensitive
 *               method: Not known
 *             isoniazid:
 *               susceptibility: Sensitive
 *               method: Not known
 *             phenotypeInformationOtherDrugs: No
 *         results:
 *           predictor:
 *             analysed: 2018-11-01 11:11:11
 *             susceptibility:
 *               Isoniazid:
 *                 prediction: R
 *               Kanamycin:
 *                 prediction: S
 *               Ethambutol:
 *                 prediction: S
 *               Streptomycin:
 *                 prediction: S
 *               Capreomycin:
 *                 prediction: S
 *               Quinolones:
 *                 prediction: S
 *               Pyrazinamide:
 *                 prediction: R
 *               Amikacin:
 *                 prediction: R
 *               Rifampicin:
 *                 prediction: R
 *             phylogenetics:
 *               phylo_group:
 *                 Mycobacterium_tuberculosis_complex:
 *                   percent_coverage: 99.722
 *                   median_depth: 122
 *               sub_complex:
 *                 Unknown:
 *                   percent_coverage: -1
 *                   median_depth: -1
 *               species:
 *                 Mycobacterium_tuberculosis:
 *                   percent_coverage: 98.199
 *                   median_depth: 116
 *               lineage:
 *                 European_American:
 *                   percent_coverage: 100.0
 *                   median_depth: 117
 *             kmer: 787
 *             probeSets:
 *               - /home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz
 *                 /home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-walker-probe-set-feb-09-2017.fasta.gz
 *             file:
 *               - /atlas/test-data/MDR.fastq.gz
 *             genotypeModel: median_depth
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
 *             id:
 *               type: string
 *             created:
 *               type: string
 *               format: date-time
 *             modified:
 *               type: string
 *               format: date-time
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
 *             metadata:
 *               type: object
 *               properties:
 *                 patient:
 *                   type: object
 *                   properties:
 *                     patientId:
 *                       type: string
 *                     siteId:
 *                       type: string
 *                     genderAtBirth:
 *                       type: string
 *                     countryOfBirth:
 *                       type: string
 *                     age:
 *                       type: number
 *                     bmi:
 *                       type: number
 *                     injectingDrugUse:
 *                       type: string
 *                     homeless:
 *                       type: string
 *                     imprisoned:
 *                       type: string
 *                     smoker:
 *                       type: string
 *                     diabetic:
 *                       type: string
 *                     hivStatus:
 *                       type: string
 *                     art:
 *                       type: string
 *                 sample:
 *                   type: object
 *                   properties:
 *                     labId:
 *                       type: string
 *                     isolateId:
 *                       type: string
 *                     collectionDate:
 *                       type: string
 *                       format: date-time
 *                     prospectiveIsolate:
 *                       type: boolean
 *                     countryIsolate:
 *                       type: string
 *                     cityIsolate:
 *                       type: string
 *                     dateArrived:
 *                       type: string
 *                       format: date-time
 *                     anatomicalOrigin:
 *                       type: string
 *                     smear:
 *                       type: string
 *                 genotyping:
 *                   type: object
 *                   properties:
 *                     wgsPlatform:
 *                       type: string
 *                       enum: [HiSeq, MiSeq, NextSeq, Other]
 *                     wgsPlatformOther:
 *                       type: string
 *                     otherGenotypeInformation:
 *                       type: string
 *                       enum: [Yes, No]
 *                     genexpert:
 *                       type: string
 *                       enum: [RIF sensitive, RIF resistant, RIF inconclusive, Not tested]
 *                     hain:
 *                       type: string
 *                       enum: [INH/RIF test,Fluoroquinolone/aminoglycoside/ethambutol test,Both,Not tested]
 *                     hainRif:
 *                       type: string
 *                       enum: [RIF sensitive, RIF resistant, RIF inconclusive, Not tested]
 *                     hainInh:
 *                       type: string
 *                       enum: [INH sensitive, INH resistant, INH inconclusive, Not tested]
 *                     hainFl:
 *                       type: string
 *                       enum: [FL sensitive, FL resistant, FL inconclusive, Not tested]
 *                     hainAm:
 *                       type: string
 *                       enum: [AM sensitive, AM resistant, AM inconclusive, Not tested]
 *                     hainEth:
 *                       type: string
 *                       enum: [ETH sensitive, ETH resistant, ETH inconclusive, Not tested]
 *                 phenotyping:
 *                   type: object
 *                   properties:
 *                     phenotypeInformationFirstLineDrugs:
 *                        type: string
 *                        enum: [Yes, No]
 *                     rifampicin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     ethambutol:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     pyrazinamide:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     isoniazid:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     phenotypeInformationOtherDrugs:
 *                        type: string
 *                        enum: [Yes, No]
 *                     rifabutin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     ofloxacin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     ciprofloxacin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     levofloxacin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     gatifloxacin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     amikacin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     kanamycin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     gentamicin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     streptomycin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     capreomycin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     clofazimine:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     pas:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     linezolid:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     ethionamideProthionamide:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     rerizidone:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     amoxicilinClavulanate:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     thioacetazone:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     imipenemImipenemcilastatin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     meropenem:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     clarythromycin:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     highDoseIsoniazid:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     bedaquiline:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     delamanid:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     prothionamide:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     pretothionamide:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     pretomanid:
 *                        type: object
 *                        properties:
 *                          susceptibility:
 *                            type: string
 *                            enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                          method:
 *                            type: string
 *                            enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                 treatment:
 *                   type: object
 *                   properties:
 *                     previousTbinformation:
 *                       type: string
 *                       enum: [Yes, No]
 *                     recentMdrTb:
 *                       type: string
 *                       enum: [Yes,No,Not known]
 *                     priorTreatmentDate:
 *                       type: string
 *                       format: date-time
 *                     tbProphylaxis:
 *                       type: string
 *                       enum: [Yes,No,Not known]
 *                     tbProphylaxisDate:
 *                       type: string
 *                       format: date-time
 *                     currentTbinformation:
 *                       type: string
 *                       enum: [Yes, No]
 *                     startProgrammaticTreatment:
 *                       type: string
 *                       enum: [Yes, No]
 *                     intensiveStartDate:
 *                       type: string
 *                       format: date-time
 *                     intensiveStopDate:
 *                       type: string
 *                       format: date-time
 *                     startProgrammaticContinuationTreatment:
 *                       type: string
 *                       enum: [Yes,No,Not known]
 *                     continuationStartDate:
 *                       type: string
 *                       format: date-time
 *                     continuationStopDate:
 *                       type: string
 *                       format: date-time
 *                     nonStandardTreatment:
 *                       type: string
 *                       enum: [Yes,No,Not known]
 *                     sputumSmearConversion:
 *                       type: string
 *                     sputumCultureConversion:
 *                       type: string
 *                     outsideStandardPhaseRifampicinRifabutin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseEthambutol:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhasePyrazinamide:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseIsoniazid:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseOfloxacin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseMoxifloxacin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseLevofloxacin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseGatifloxacin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseAmikacin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseGentamicin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseStreptomycin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseCapreomycin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseClofazimine:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhasePas:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseLinezolid:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseEthionamideProthionamide:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseTerizidone:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseAmoxicilinClavulanate:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseThioacetazone:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseImipenemImipenemcilastatin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseMeropenem:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseClarythromycin:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                     outsideStandardPhaseHighDoseIsoniazid:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date
 *                         stop:
 *                           type: string
 *                           format: date
 *                 outcome:
 *                   type: object
 *                   properties:
 *                     whoOutcomeCategory:
 *                       type: string
 *                     dateOfDeath:
 *                       type: string
 *                       format: date-time
 *             results:
 *               type: object
 *               properties:
 *                 predictor:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     analysed:
 *                       type: string
 *                     susceptibility:
 *                       type: object
 *                     phylogenetics:
 *                       type: object
 *                     kmer:
 *                       type: number
 *                     probeSets:
 *                       type: array
 *                       items:
 *                         type: string
 *                     file:
 *                       type: array
 *                       items:
 *                         type: string
 *                     genotypeModel:
 *                       type: string
 *     example:
 *       status: success
 *       data:
 *         - id: 588624076182796462cb133e
 *           owner:
 *             firstname: Sean
 *             lastname: Leavy
 *             phone: +44 7968 716851
 *             email: sean@gmail.com
 *           created: 2018-07-19T13:23:18.776Z
 *           modified: 2018-07-19T13:23:18.776Z
 *           metadata:
 *             patient:
 *               patientId: eff2fa6a-9d79-41ab-a307-b620cedf7293
 *               siteId: a2a910e3-25ef-475c-bdf9-f6fe215d949f
 *               genderAtBirth: Male
 *               countryOfBirth: India
 *               age: 43
 *               bmi: 25.3
 *               injectingDrugUse: No
 *               homeless: No
 *               imprisoned: No
 *               smoker: Yes
 *               diabetic: Insulin
 *               hivStatus: Not tested
 *             sample:
 *               labId: d19637ed-e5b4-4ca7-8418-8713646a3359
 *               isolateId: 9c0c00f2-8cb1-4254-bf53-3271f35ce696
 *               collectionDate: 2018-10-19
 *               prospectiveIsolate: Yes
 *               countryIsolate: India
 *               cityIsolate: Mumbai
 *               dateArrived: 2018-09-01
 *               anatomicalOrigin: Respiratory
 *               smear: Not known
 *             genotyping:
 *               wgsPlatform: MiSeq
 *               otherGenotypeInformation: Yes
 *               genexpert: Not tested
 *               hain: INH/RIF test
 *               hainRif: RIF resistant
 *               hainInh: INH sensitive
 *               hainFl: Not tested
 *               hainAm: Not tested
 *               hainEth: Not tested
 *             phenotyping:
 *               phenotypeInformationFirstLineDrugs: Yes
 *               rifampicin:
 *                 susceptibility: Resistant
 *                 method: Not known
 *               ethambutol:
 *                 susceptibility: Sensitive
 *                 method: Not known
 *               pyrazinamide:
 *                 susceptibility: Sensitive
 *                 method: Not known
 *               isoniazid:
 *                 susceptibility: Sensitive
 *                 method: Not known
 *               phenotypeInformationOtherDrugs: No
 *           results:
 *             predictor:
 *               analysed: 2018-11-01 11:11:11
 *               susceptibility:
 *                 Isoniazid:
 *                   prediction: R
 *                 Kanamycin:
 *                   prediction: S
 *                 Ethambutol:
 *                   prediction: S
 *                 Streptomycin:
 *                   prediction: S
 *                 Capreomycin:
 *                   prediction: S
 *                 Quinolones:
 *                   prediction: S
 *                 Pyrazinamide:
 *                   prediction: R
 *                 Amikacin:
 *                   prediction: R
 *                 Rifampicin:
 *                   prediction: R
 *               phylogenetics:
 *                 phylo_group:
 *                   Mycobacterium_tuberculosis_complex:
 *                     percent_coverage: 99.722
 *                     median_depth: 122
 *                 sub_complex:
 *                   Unknown:
 *                     percent_coverage: -1
 *                     median_depth: -1
 *                 species:
 *                   Mycobacterium_tuberculosis:
 *                     percent_coverage: 98.199
 *                     median_depth: 116
 *                 lineage:
 *                   European_American:
 *                     percent_coverage: 100.0
 *                     median_depth: 117
 *               kmer: 787
 *               probeSets:
 *                 - /home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz
 *                   /home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-walker-probe-set-feb-09-2017.fasta.gz
 *               file:
 *                 - /atlas/test-data/MDR.fastq.gz
 *               genotypeModel: median_depth
 *               r: true
 *               mdr: true
 *               xdr: false
 *               tdr: false
 */
/**
 * @swagger
 * definitions:
 *   ExperimentResultsResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           resultType1:
 *             type: object
 *           resultType2:
 *             type: object
 *     example:
 *       status: success
 *       data:
 *         susceptibility:
 *           Isoniazid:
 *             prediction: R
 *           Kanamycin:
 *             prediction: S
 *           Ethambutol:
 *             prediction: S
 *           Streptomycin:
 *             prediction: S
 *           Capreomycin:
 *             prediction: S
 *           Quinolones:
 *             prediction: S
 *           Pyrazinamide:
 *             prediction: R
 *           Amikacin:
 *             prediction: R
 *           Rifampicin:
 *             prediction: R
 *         phylogenetics:
 *           phylo_group:
 *             Mycobacterium_tuberculosis_complex:
 *               percent_coverage: 99.722
 *               median_depth: 122
 *           sub_complex:
 *             Unknown:
 *               percent_coverage: -1
 *               median_depth: -1
 *           species:
 *             Mycobacterium_tuberculosis:
 *               percent_coverage: 98.199
 *               median_depth: 116
 *           lineage:
 *             European_American:
 *               percent_coverage: 100.0
 *               median_depth: 117
 *         kmer: 787
 *         probeSets:
 *           - /home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-species-170421.fasta.gz
 *             /home/admin/git/mykrobe-atlas-cli/src/mykrobe/data/panels/tb-walker-probe-set-feb-09-2017.fasta.gz
 *         file:
 *           - /atlas/test-data/MDR.fastq.gz
 *         genotypeModel: median_depth
 *         r: true
 *         mdr: true
 *         xdr: false
 *         tdr: false
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
 *           results:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 relevance:
 *                   type: integer
 *                 id:
 *                   type: string
 *                 created:
 *                   type: string
 *                   format: date-time
 *                 modified:
 *                   type: string
 *                   format: date-time
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
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     patient:
 *                       type: object
 *                       properties:
 *                         patientId:
 *                           type: string
 *                         siteId:
 *                           type: string
 *                         genderAtBirth:
 *                           type: string
 *                         countryOfBirth:
 *                           type: string
 *                         age:
 *                           type: number
 *                         bmi:
 *                           type: number
 *                         injectingDrugUse:
 *                           type: string
 *                         homeless:
 *                           type: string
 *                         imprisoned:
 *                           type: string
 *                         smoker:
 *                           type: string
 *                         diabetic:
 *                           type: string
 *                         hivStatus:
 *                           type: string
 *                         art:
 *                           type: string
 *                     sample:
 *                       type: object
 *                       properties:
 *                         labId:
 *                           type: string
 *                         isolateId:
 *                           type: string
 *                         collectionDate:
 *                           type: string
 *                           format: date-time
 *                         prospectiveIsolate:
 *                           type: boolean
 *                         countryIsolate:
 *                           type: string
 *                         cityIsolate:
 *                           type: string
 *                         dateArrived:
 *                           type: string
 *                           format: date-time
 *                         anatomicalOrigin:
 *                           type: string
 *                         smear:
 *                           type: string
 *                     genotyping:
 *                       type: object
 *                       properties:
 *                         wgsPlatform:
 *                           type: string
 *                           enum: [HiSeq, MiSeq, NextSeq, Other]
 *                         wgsPlatformOther:
 *                           type: string
 *                         otherGenotypeInformation:
 *                           type: string
 *                           enum: [Yes, No]
 *                         genexpert:
 *                           type: string
 *                           enum: [RIF sensitive, RIF resistant, RIF inconclusive, Not tested]
 *                         hain:
 *                           type: string
 *                           enum: [INH/RIF test,Fluoroquinolone/aminoglycoside/ethambutol test,Both,Not tested]
 *                         hainRif:
 *                           type: string
 *                           enum: [RIF sensitive, RIF resistant, RIF inconclusive, Not tested]
 *                         hainInh:
 *                           type: string
 *                           enum: [INH sensitive, INH resistant, INH inconclusive, Not tested]
 *                         hainFl:
 *                           type: string
 *                           enum: [FL sensitive, FL resistant, FL inconclusive, Not tested]
 *                         hainAm:
 *                           type: string
 *                           enum: [AM sensitive, AM resistant, AM inconclusive, Not tested]
 *                         hainEth:
 *                           type: string
 *                           enum: [ETH sensitive, ETH resistant, ETH inconclusive, Not tested]
 *                     phenotyping:
 *                       type: object
 *                       properties:
 *                         phenotypeInformationFirstLineDrugs:
 *                            type: string
 *                            enum: [Yes, No]
 *                         rifampicin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         ethambutol:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         pyrazinamide:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         isoniazid:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         phenotypeInformationOtherDrugs:
 *                            type: string
 *                            enum: [Yes, No]
 *                         rifabutin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         ofloxacin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         ciprofloxacin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         levofloxacin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         gatifloxacin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         amikacin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         kanamycin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         gentamicin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         streptomycin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         capreomycin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         clofazimine:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         pas:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         linezolid:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         ethionamideProthionamide:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         rerizidone:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         amoxicilinClavulanate:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         thioacetazone:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         imipenemImipenemcilastatin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         meropenem:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         clarythromycin:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         highDoseIsoniazid:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         bedaquiline:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         delamanid:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         prothionamide:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         pretothionamide:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                         pretomanid:
 *                            type: object
 *                            properties:
 *                              susceptibility:
 *                                type: string
 *                                enum: [Sensitive, Resistant, Inconclusive, Not tested]
 *                              method:
 *                                type: string
 *                                enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
 *                     treatment:
 *                       type: object
 *                       properties:
 *                         previousTbinformation:
 *                           type: string
 *                           enum: [Yes, No]
 *                         recentMdrTb:
 *                           type: string
 *                           enum: [Yes,No,Not known]
 *                         priorTreatmentDate:
 *                           type: string
 *                           format: date-time
 *                         tbProphylaxis:
 *                           type: string
 *                           enum: [Yes,No,Not known]
 *                         tbProphylaxisDate:
 *                           type: string
 *                           format: date-time
 *                         currentTbinformation:
 *                           type: string
 *                           enum: [Yes, No]
 *                         startProgrammaticTreatment:
 *                           type: string
 *                           enum: [Yes, No]
 *                         intensiveStartDate:
 *                           type: string
 *                           format: date-time
 *                         intensiveStopDate:
 *                           type: string
 *                           format: date-time
 *                         startProgrammaticContinuationTreatment:
 *                           type: string
 *                           enum: [Yes,No,Not known]
 *                         continuationStartDate:
 *                           type: string
 *                           format: date-time
 *                         continuationStopDate:
 *                           type: string
 *                           format: date-time
 *                         nonStandardTreatment:
 *                           type: string
 *                           enum: [Yes,No,Not known]
 *                         sputumSmearConversion:
 *                           type: string
 *                         sputumCultureConversion:
 *                           type: string
 *                         outsideStandardPhaseRifampicinRifabutin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseEthambutol:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhasePyrazinamide:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseIsoniazid:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseOfloxacin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseMoxifloxacin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseLevofloxacin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseGatifloxacin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseAmikacin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseGentamicin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseStreptomycin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseCapreomycin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseClofazimine:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhasePas:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseLinezolid:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseEthionamideProthionamide:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseTerizidone:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseAmoxicilinClavulanate:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseThioacetazone:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseImipenemImipenemcilastatin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseMeropenem:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseClarythromycin:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                         outsideStandardPhaseHighDoseIsoniazid:
 *                           type: object
 *                           properties:
 *                             start:
 *                               type: string
 *                               format: date
 *                             stop:
 *                               type: string
 *                               format: date
 *                     outcome:
 *                       type: object
 *                       properties:
 *                         whoOutcomeCategory:
 *                           type: string
 *                         dateOfDeath:
 *                           type: string
 *                           format: date-time
 *           total:
 *             type: integer
 *           metadata:
 *             type: object
 *             properties:
 *               speed:
 *                 type: integer
 *               maxRelevance:
 *                 type: integer
 *           pagination:
 *             type: object
 *             properties:
 *               per:
 *                 type: integer
 *               page:
 *                 type: integer
 *               previous:
 *                 type: integer
 *               next:
 *                 type: integer
 *               pages:
 *                 type: integer
 *           search:
 *             type: object
 *             properties:
 *               filter1:
 *                 type: string
 *               filter2:
 *                 type: string
 *               filter3:
 *                 type: string
 *               filter4:
 *                 type: string
 *               filter5:
 *                 type: string
 *     example:
 *       status: success
 *       data:
 *         search:
 *           metadata.patient.smoker: Yes
 *         metadata:
 *           speed: 0
 *           maxRelevance: 1
 *         pagination:
 *           per: 10
 *           page: 2
 *           previous: 1
 *           next: 2
 *           pages: 5
 *         total: 47
 *         results:
 *           - id: 588624076182796462cb133e
 *             owner:
 *               firstname: Sean
 *               lastname: Leavy
 *               phone: +44 7968 716851
 *               email: sean@gmail.com
 *             created: 2018-07-19T13:23:18.776Z
 *             modified: 2018-07-19T13:23:18.776Z
 *             metadata:
 *               patient:
 *                 patientId: eff2fa6a-9d79-41ab-a307-b620cedf7293
 *                 siteId: a2a910e3-25ef-475c-bdf9-f6fe215d949f
 *                 genderAtBirth: Male
 *                 countryOfBirth: India
 *                 age: 43
 *                 bmi: 25.3
 *                 injectingDrugUse: No
 *                 homeless: No
 *                 imprisoned: No
 *                 smoker: Yes
 *                 diabetic: Insulin
 *                 hivStatus: Not tested
 *               sample:
 *                 labId: d19637ed-e5b4-4ca7-8418-8713646a3359
 *                 isolateId: 9c0c00f2-8cb1-4254-bf53-3271f35ce696
 *                 collectionDate: 2018-10-19
 *                 prospectiveIsolate: Yes
 *                 countryIsolate: India
 *                 cityIsolate: Mumbai
 *                 dateArrived: 2018-09-01
 *                 anatomicalOrigin: Respiratory
 *                 smear: Not known
 *               genotyping:
 *                 wgsPlatform: MiSeq
 *                 otherGenotypeInformation: Yes
 *                 genexpert: Not tested
 *                 hain: INH/RIF test
 *                 hainRif: RIF resistant
 *                 hainInh: INH sensitive
 *                 hainFl:  Not tested
 *                 hainAm:  Not tested
 *                 hainEth: Not tested
 *               phenotyping:
 *                 phenotypeInformationFirstLineDrugs: Yes
 *                 rifampicin:
 *                   susceptibility: Resistant
 *                   method: Not known
 *                 ethambutol:
 *                   susceptibility: Sensitive
 *                   method: Not known
 *                 pyrazinamide:
 *                   susceptibility: Sensitive
 *                   method: Not known
 *                 isoniazid:
 *                   susceptibility: Sensitive
 *                   method: Not known
 *                 phenotypeInformationOtherDrugs: No
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               titles:
 *                 type: array
 *                 items:
 *                   type: string
 *               choices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     count:
 *                       type: integer
 *           field2:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               titles:
 *                 type: array
 *                 items:
 *                   type: string
 *               choices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     count:
 *                       type: integer
 *           field3:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               titles:
 *                 type: array
 *                 items:
 *                   type: string
 *               choices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     count:
 *                       type: integer
 *           field4:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               titles:
 *                 type: array
 *                 items:
 *                   type: string
 *               choices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     count:
 *                       type: integer
 *           field5:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               titles:
 *                 type: array
 *                 items:
 *                   type: string
 *               choices:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     count:
 *                       type: integer
 *           range1:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               titles:
 *                 type: array
 *                 items:
 *                   type: string
 *               min:
 *                 type: integer
 *               max:
 *                 type: integer
 *           range2:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               titles:
 *                 type: array
 *                 items:
 *                   type: string
 *               min:
 *                 type: string
 *               max:
 *                 type: string
 *     example:
 *       status: success
 *       data:
 *         metadata.sample.collectionDate:
 *           title: Collection date
 *           titles:
 *             - Meatadata
 *               Sample
 *               Collection date
 *           min: 2018-04-03T14:03:00.036Z
 *           max: 2018-05-03T12:09:57.322Z
 *         metadata.patient.patientAge:
 *           title: Age
 *           titles:
 *             - Meatadata
 *               Patient
 *               Age
 *           min: 4
 *           max: 63
 *         metadata.patient.smoker:
 *           title: Smoker
 *           titles:
 *             - Meatadata
 *               Patient
 *               Smoker
 *           Yes: 57
 *           No: 63
 *         metadata.patient.countryOfBirth:
 *           title: Country of birth
 *           titles:
 *             - Meatadata
 *               Patient
 *               Country of birth
 *           choices:
 *             - key: India
 *               count: 12
 *             - key: China
 *               count: 27
 */
/**
 * @swagger
 * definitions:
 *   ExperimentsTreeResponse:
 *     properties:
 *       status:
 *         type: string
 *       data:
 *         type: object
 *         properties:
 *           type:
 *             type: string
 *           tree:
 *             type: string
 *           version:
 *             type: string
 *           expires:
 *             type: string
 *             format: date-time
 *           id:
 *             type: string
 *
 *     example:
 *       status: success
 *       data:
 *         tree: (C00011434:0.0000466370637232255
 *         version: "1.0"
 *         type: newick
 *         expires: 2019-03-19T15:54:14.818Z
 *         id: 5ba263168d6c3e1c69943595
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
   *     security:
   *       - Bearer: []
   *     parameters:
   *       - in: body
   *         name: experiment
   *         description: The experiment data
   *         schema:
   *           type: object
   *           properties:
   *             id:
   *               type: string
   *             created:
   *               type: string
   *               format: date-time
   *             modified:
   *               type: string
   *               format: date-time
   *             metadata:
   *               type: object
   *               properties:
   *                 patient:
   *                   type: object
   *                   properties:
   *                     patientId:
   *                       type: string
   *                     siteId:
   *                       type: string
   *                     genderAtBirth:
   *                       type: string
   *                     countryOfBirth:
   *                       type: string
   *                     age:
   *                       type: number
   *                     bmi:
   *                       type: number
   *                     injectingDrugUse:
   *                       type: string
   *                     homeless:
   *                       type: string
   *                     imprisoned:
   *                       type: string
   *                     smoker:
   *                       type: string
   *                     diabetic:
   *                       type: string
   *                     hivStatus:
   *                       type: string
   *                     art:
   *                       type: string
   *                 sample:
   *                   type: object
   *                   properties:
   *                     labId:
   *                       type: string
   *                     isolateId:
   *                       type: string
   *                     collectionDate:
   *                       type: string
   *                       format: date-time
   *                     prospectiveIsolate:
   *                       type: boolean
   *                     countryIsolate:
   *                       type: string
   *                     cityIsolate:
   *                       type: string
   *                     dateArrived:
   *                       type: string
   *                       format: date-time
   *                     anatomicalOrigin:
   *                       type: string
   *                     smear:
   *                       type: string
   *                 genotyping:
   *                   type: object
   *                   properties:
   *                     wgsPlatform:
   *                       type: string
   *                       enum: [HiSeq, MiSeq, NextSeq, Other]
   *                     wgsPlatformOther:
   *                       type: string
   *                     otherGenotypeInformation:
   *                       type: string
   *                       enum: [Yes, No]
   *                     genexpert:
   *                       type: string
   *                       enum: [RIF sensitive,RIF resistant,RIF inconclusive,Not tested]
   *                     hain:
   *                       type: string
   *                       enum: [INH/RIF test,Fluoroquinolone/aminoglycoside/ethambutol test,Both,Not tested]
   *                     hainRif:
   *                       type: string
   *                       enum: [RIF sensitive, RIF resistant, RIF inconclusive, Not tested]
   *                     hainInh:
   *                       type: string
   *                       enum: [INH sensitive, INH resistant, INH inconclusive, Not tested]
   *                     hainFl:
   *                       type: string
   *                       enum: [FL sensitive, FL resistant, FL inconclusive, Not tested]
   *                     hainAm:
   *                       type: string
   *                       enum: [AM sensitive, AM resistant, AM inconclusive, Not tested]
   *                     hainEth:
   *                       type: string
   *                       enum: [ETH sensitive, ETH resistant, ETH inconclusive, Not tested]
   *                 phenotyping:
   *                   type: object
   *                   properties:
   *                     phenotypeInformationFirstLineDrugs:
   *                       type: string
   *                       enum: [Yes, No]
   *                     rifampicin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     ethambutol:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     pyrazinamide:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     isoniazid:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     phenotypeInformationOtherDrugs:
   *                       type: string
   *                       enum: [Yes, No]
   *                     rifabutin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     ofloxacin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     ciprofloxacin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     levofloxacin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     gatifloxacin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     amikacin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     kanamycin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     gentamicin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     streptomycin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     capreomycin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     clofazimine:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     pas:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     linezolid:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     ethionamideProthionamide:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     rerizidone:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     amoxicilinClavulanate:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     thioacetazone:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     imipenemImipenemcilastatin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     meropenem:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     clarythromycin:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     highDoseIsoniazid:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     bedaquiline:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     delamanid:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     prothionamide:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     pretothionamide:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                     pretomanid:
   *                       type: object
   *                       properties:
   *                         susceptibility:
   *                           type: string
   *                           enum: [Sensitive, Resistant, Inconclusive, Not tested]
   *                         method:
   *                           type: string
   *                           enum: [MGIT, LJ, Microtitre plate, MODS, Other, Not known]
   *                 treatment:
   *                   type: object
   *                   properties:
   *                     previousTbinformation:
   *                       type: string
   *                       enum: [Yes, No]
   *                     recentMdrTb:
   *                       type: string
   *                       enum: [Yes,No,Not known]
   *                     priorTreatmentDate:
   *                       type: string
   *                       format: date-time
   *                     tbProphylaxis:
   *                       type: string
   *                       enum: [Yes,No,Not known]
   *                     tbProphylaxisDate:
   *                       type: string
   *                       format: date-time
   *                     currentTbinformation:
   *                       type: string
   *                       enum: [Yes, No]
   *                     startProgrammaticTreatment:
   *                       type: string
   *                       enum: [Yes, No]
   *                     intensiveStartDate:
   *                       type: string
   *                       format: date-time
   *                     intensiveStopDate:
   *                       type: string
   *                       format: date-time
   *                     startProgrammaticContinuationTreatment:
   *                       type: string
   *                       enum: [Yes,No,Not known]
   *                     continuationStartDate:
   *                       type: string
   *                       format: date-time
   *                     continuationStopDate:
   *                       type: string
   *                       format: date-time
   *                     nonStandardTreatment:
   *                       type: string
   *                       enum: [Yes,No,Not known]
   *                     sputumSmearConversion:
   *                       type: string
   *                     sputumCultureConversion:
   *                       type: string
   *                     outsideStandardPhaseRifampicinRifabutin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseEthambutol:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhasePyrazinamide:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseIsoniazid:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseOfloxacin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseMoxifloxacin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseLevofloxacin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseGatifloxacin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseAmikacin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseGentamicin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseStreptomycin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseCapreomycin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseClofazimine:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhasePas:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseLinezolid:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseEthionamideProthionamide:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseTerizidone:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseAmoxicilinClavulanate:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseThioacetazone:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseImipenemImipenemcilastatin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseMeropenem:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseClarythromycin:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                     outsideStandardPhaseHighDoseIsoniazid:
   *                       type: object
   *                       properties:
   *                         start:
   *                           type: string
   *                           format: date
   *                         stop:
   *                           type: string
   *                           format: date
   *                 outcome:
   *                   type: object
   *                   properties:
   *                     whoOutcomeCategory:
   *                       type: string
   *                     dateOfDeath:
   *                       type: string
   *                       format: date-time
   *                     kmer:
   *                       type: number
   *                     probeSets:
   *                       type: array
   *                       items:
   *                         type: string
   *                     file:
   *                       type: array
   *                       items:
   *                         type: string
   *                     genotypeModel:
   *                       type: string
   *                     r:
   *                       type: boolean
   *                     mdr:
   *                       type: boolean
   *                     xdr:
   *                       type: boolean
   *                     tdr:
   *                       type: boolean
   *           example:
   *             metadata:
   *               patient:
   *                 patientId: eff2fa6a-9d79-41ab-a307-b620cedf7293
   *                 siteId: a2a910e3-25ef-475c-bdf9-f6fe215d949f
   *                 genderAtBirth: Male
   *                 countryOfBirth: India
   *                 age: 43
   *                 bmi: 25.3
   *                 injectingDrugUse: No
   *                 homeless: No
   *                 imprisoned: No
   *                 smoker: Yes
   *                 diabetic: Insulin
   *                 hivStatus: Not tested
   *               sample:
   *                 labId: d19637ed-e5b4-4ca7-8418-8713646a3359
   *                 isolateId: 9c0c00f2-8cb1-4254-bf53-3271f35ce696
   *                 collectionDate: 2018-10-19
   *                 prospectiveIsolate: Yes
   *                 countryIsolate: India
   *                 cityIsolate: Mumbai
   *                 dateArrived: 2018-09-01
   *                 anatomicalOrigin: Respiratory
   *                 smear: Not known
   *               genotyping:
   *                 wgsPlatform: MiSeq
   *                 otherGenotypeInformation: Yes
   *                 genexpert: Not tested
   *                 hain: INH/RIF test
   *                 hainRif: RIF resistant
   *                 hainInh: INH sensitive
   *                 hainFl: Not tested
   *                 hainAm: Not tested
   *                 hainEth: Not tested
   *               phenotyping:
   *                 phenotypeInformationFirstLineDrugs: Yes
   *               rifampicin:
   *                 susceptibility: Resistant
   *                 method: Not known
   *               ethambutol:
   *                 susceptibility: Sensitive
   *                 method: Not known
   *               pyrazinamide:
   *                 susceptibility: Sensitive
   *                 method: Not known
   *               isoniazid:
   *                 susceptibility: Sensitive
   *                 method: Not known
   *                 phenotypeInformationOtherDrugs: No
   *               outcome:
   *                 type: result type
   *                 analysed: Yes
   *                 susceptibility:
   *                   - lorem
   *                     ipsum
   *                 phylogenetics:
   *                   et:
   *                     voluptas:
   *                       percentCoverage: 37.59
   *                       medianDepth: 55
   *                 kmer: 787
   *                 probeSets:
   *                   - lorem
   *                     ipsum
   *                     lord
   *                 file:
   *                   - file1.pdf
   *                     file2.pdf
   *                 genotypeModel: dolorem
   *     responses:
   *       200:
   *         description: Experiment data
   *         schema:
   *           $ref: '#/definitions/ExperimentResponse'
   *       500:
   *         description: Validation Failed
   *         schema:
   *           $ref: '#/definitions/ValidationErrorResponse'
   *       401:
   *         description: Failed authentication
   */
  .post(
    keycloak.connect.protect(),
    jsonschema.schemaValidation(schemas["experiment"], errors, "CreateExperimentError", "all"),
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
   *         name: q
   *         type: string
   *         description: A free text query
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
   *         enum: [Diet alone,Tablets,Insulin,Insulin+tablets,Not known]
   *         description: Whether the patient is diabetic
   *       - in: query
   *         name: metadata.patient.genderAtBirth
   *         type: string
   *         enum: [Male,Female,Other or Intersex,Not known / unavailable]
   *         description: The patient's gender when born
   *       - in: query
   *         name: metadata.patient.hivStatus
   *         type: string
   *         enum: ["Tested, negative", "Tested, positive",Not tested,Not known]
   *         description: The patient's HIV status
   *       - in: query
   *         name: metadata.patient.homeless
   *         type: string
   *         enum: [Yes, No]
   *         description: Whether the patient is homeless
   *       - in: query
   *         name: metadata.patient.imprisoned
   *         type: string
   *         enum: [Yes, No]
   *         description: Whether the patient is in prison
   *       - in: query
   *         name: metadata.patient.injectingDrugUse
   *         type: string
   *         enum: [Yes, No]
   *         description: Whether the patient injects drugs
   *       - in: query
   *         name: metadata.patient.smoker
   *         type: string
   *         enum: [Yes, No]
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
   *         name: q
   *         type: string
   *         description: A free text query
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
   *         enum: [Diet alone,Tablets,Insulin,Insulin+tablets,Not known]
   *         description: Whether the patient is diabetic
   *       - in: query
   *         name: metadata.patient.genderAtBirth
   *         type: string
   *         enum: [Male,Female,Other or Intersex,Not known / unavailable]
   *         description: The patient's gender when born
   *       - in: query
   *         name: metadata.patient.hivStatus
   *         type: string
   *         enum: ["Tested, negative", "Tested, positive", "Not tested", "Not known"]
   *         description: The patient's HIV status
   *       - in: query
   *         name: metadata.patient.homeless
   *         type: string
   *         enum: [Yes, No]
   *         description: Whether the patient is homeless
   *       - in: query
   *         name: metadata.patient.imprisoned
   *         type: string
   *         enum: [Yes, No]
   *         description: Whether the patient is in prison
   *       - in: query
   *         name: metadata.patient.injectingDrugUse
   *         type: string
   *         enum: [Yes, No]
   *         description: Whether the patient injects drugs
   *       - in: query
   *         name: metadata.patient.smoker
   *         type: string
   *         enum: [Yes, No]
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
  .get(keycloak.connect.protect(), userController.loadCurrentUser, experimentController.search);

router
  .route("/tree")
  /**
   * @swagger
   * /experiments/tree:
   *   get:
   *     tags:
   *       - Experiments
   *     description: Experiments tree
   *     operationId: experimentsTree
   *     produces:
   *       - application/json
   *     security:
   *       - Bearer: []
   *     responses:
   *       200:
   *         description: Experiments tree
   *         schema:
   *           $ref: '#/definitions/ExperimentsTreeResponse'
   *       401:
   *         description: Failed authentication
   */
  .get(keycloak.connect.protect(), experimentController.tree);

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
   *       500:
   *         description: Validation Failed
   *         schema:
   *           $ref: '#/definitions/ValidationErrorResponse'
   *       401:
   *         description: Failed authentication
   */
  .put(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    ownerOnly,
    experimentController.update
  )
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
  .delete(
    keycloak.connect.protect(),
    userController.loadCurrentUser,
    ownerOnly,
    experimentController.remove
  );
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
  .route("/:id/results")
  /**
   * @swagger
   * /experiments/{id}/results:
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
  .post(experimentController.results)
  /**
   * @swagger
   * /experiments/{id}/results:
   *   get:
   *     tags:
   *       - Experiments
   *     description: Experiment results
   *     operationId: experimentResultsPerType
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
   *         description: Experiment results
   *         schema:
   *           $ref: '#/definitions/ExperimentResultsResponse'
   */
  .get(keycloak.connect.protect(), experimentController.listResults);
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
  .put(keycloak.connect.protect(), upload.single("file"), experimentController.uploadFile)
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
    jsonschema.schemaValidation(schemas["uploadExperiment"], errors, "UploadExperimentError"),
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
