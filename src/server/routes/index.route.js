import express from 'express';
import userRoutes from './user.route';
import usersRoutes from './users.route';
import authRoutes from './auth.route';
import experimentRoutes from './experiment.route';
import organisationRoutes from './organisation.route';

const router = express.Router(); // eslint-disable-line new-cap
/**
 * @apiDefine Header
 * @apiHeader {String} token Users unique token.
 *
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer {token}"
 *     }
 *
 * @apiError Unauthorized Invalid token.
 */

/**
 * @apiDefine NotFound
 * @apiError ObjectNotFound The Object was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "status": "error",
 *       "code": 10001,
 *       "message": "The object requested was not found."
 *     }
 */

/**
 * @api {get} /health-check Check service health
 * @apiName Health
 * @apiGroup Service
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "success",
 *       "data": "OK"
 *     }
 *
 */
router.get('/health-check', (req, res) =>
  res.jsend('OK')
);

// mount user routes at /users
router.use('/users', usersRoutes);

// mount auth routes at /auth
router.use('/auth', authRoutes);

// mount user routes at /user
router.use('/user', userRoutes);

// mount experiments routes at /experiments
router.use('/experiments', experimentRoutes);

// mount organisations routes at /organisations
router.use('/organisations', organisationRoutes);

export default router;
