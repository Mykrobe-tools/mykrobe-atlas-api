import jwt from "jsonwebtoken";
import passwordHash from "password-hash";
import errors from "errors";
import httpStatus from "http-status";
import randomstring from "randomstring";
import User from "../models/user.model";
import Organisation from "../models/organisation.model";
import APIError from "../helpers/APIError";

const config = require("../../config/env");

/**
 * Returns jwt token if valid email and password is provided
 * @param req
 * @param res
 * @returns {*}
 */
function login(req, res) {
  // Fetch the user from the db
  User.findOne(
    {
      email: req.body.email
    },
    (err, user) => {
      if (user && passwordHash.verify(req.body.password, user.password)) {
        if (user.valid) {
          const token = jwt.sign(
            {
              id: user.id
            },
            config.jwtSecret
          );
          return res.jsend({
            token,
            email: user.email,
            id: user.id
          });
        }
        return res.jerror(
          new APIError(
            "You must validate your account first",
            httpStatus.UNAUTHORIZED
          )
        );
      }
      return res.jerror(
        new APIError("Invalid credentials supplied", httpStatus.UNAUTHORIZED)
      );
    }
  );
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.jsend({
    user: req.user,
    num: Math.random() * 100
  });
}

/**
 * This is a function to generate the token and send email.
 * @param req
 * @param res
 * @returns {*}
 */
function forgot(req, res) {
  const random = randomstring.generate();
  User.findUserAndUpdate(
    { email: req.body.email },
    { resetPasswordToken: random }
  )
    .then(user => {
      const queue = config.monqClient.queue(config.notification);
      queue.enqueue("forgot", { to: user.email, token: random }, () =>
        res.jsend(`Email sent successfully to ${user.email}`)
      );
    })
    .catch(e => res.jerror(e));
}

/**
 * This is a function to reset the users password.
 * @param req
 * @param res
 * @returns {*}
 */
function reset(req, res) {
  User.getByResetPasswordToken(req.body.resetPasswordToken)
    .then(user => {
      const newPassword = passwordHash.generate(req.body.password);
      user.password = newPassword; // eslint-disable-line no-param-reassign
      user
        .save()
        .then(savedUser =>
          res.jsend(`Password was reset successfully for ${savedUser.email}`)
        )
        .catch(e => res.jerror(new errors.UpdateUserError(e.message)));
    })
    .catch(e => res.jerror(e));
}

/**
 * This is a function to verify the users account.
 * @param req
 * @param res
 * @returns {*}
 */
function verify(req, res) {
  // move to ES6-based bluebird bind
  User.getByVerificationToken(req.body.verificationToken)
    .then(user => {
      const candidateUser = user;
      candidateUser.valid = true;
      candidateUser.verificationToken = null;
      return Organisation.findOne({}).then(organisation => {
        candidateUser.organisation = organisation;
        return candidateUser.save();
      });
    })
    .then(verifiedUser => res.jsend(verifiedUser))
    .catch(e => res.jerror(e));
}

/**
 * This is a function to resend the activation code.
 * @param req
 * @param res
 * @returns {*}
 */
function resend(req, res) {
  const { email } = req.body;
  User.getByEmail(email)
    .then(user => user.generateVerificationToken())
    .then(userWithToken => {
      const queue = config.monqClient.queue(config.notification);
      queue.enqueue(
        "welcome",
        { token: userWithToken.verificationToken, to: userWithToken.email },
        () => res.jsend(`Notification was resent by ${config.notification}`)
      );
    })
    .catch(e => res.jerror(e));
}

export default { login, getRandomNumber, forgot, reset, verify, resend };
