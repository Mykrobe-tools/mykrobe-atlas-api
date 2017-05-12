import express from 'express';
import expressJwt from 'express-jwt';
import organisationController from '../controllers/organisation.controller';
import config from '../../config/env';

const router = express.Router(); // eslint-disable-line new-cap


  /**
   * @apiDefine OrganisationResponse
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": {
   *         "name": "Apex Entertainment",
   *         "template": "Apex template",
   *         "id": "58e4c7526555100f447d50eb"
   *       }
   *     }
   */
router.route('/')
  /**
   * @api {get} /organisations Get organisations list
   *
   * @apiName List organisations
   * @apiGroup Organisations
   * @apiUse Header
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": [{
   *         "name": "Apex Entertainment"
   *       }]
   *     }
   */
  .get(expressJwt({ secret: config.jwtSecret }),
       organisationController.list)
  /**
   * @api {post} /organisations Create new organisation
   *
   * @apiName Create new organisation
   * @apiGroup Organisations
   * @apiUse Header
   * @apiUse OrganisationResponse
   *
   * @apiParam {String} name The name of organisation.
   *
   */
  .post(expressJwt({ secret: config.jwtSecret }),
       organisationController.create);

router.route('/:id')
  /**
   * @api {get} /organisations/:id Read an organisation
   *
   * @apiName Read organisation
   * @apiGroup Organisations
   * @apiUse Header
   * @apiUse OrganisationResponse
   *
   * @apiParam {String} id The organisation ID.
   *
   */
  .get(expressJwt({ secret: config.jwtSecret }),
       organisationController.get)
  /**
   * @api {put} /organisations/:id Update existing organisation
   *
   * @apiName Update organisation
   * @apiGroup Organisations
   * @apiUse Header
   * @apiUse OrganisationResponse
   *
   * @apiParam {String} id The organisation ID.
   * @apiParam {String} name The name of organisation.
   *
   */
  .put(expressJwt({ secret: config.jwtSecret }),
       organisationController.update)
  /**
   * @api {delete} /organisations/:id Delete existing organisation
   *
   * @apiName Delete organisation
   * @apiGroup Organisations
   * @apiUse Header
   *
   * @apiParam {String} id The organisation ID.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "status": "success",
   *       "data": "Organisation was successfully deleted."
   *     }
   *
   */
  .delete(expressJwt({ secret: config.jwtSecret }),
       organisationController.remove);

/** Load user when API with id route parameter is hit */
router.param('id', organisationController.load);

export default router;
