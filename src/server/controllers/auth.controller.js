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
async function forgot(req, res) {
  const random = randomstring.generate();
  try {
    const user = await User.findUserAndUpdate(
      { email: req.body.email },
      { resetPasswordToken: random }
    );
    const queue = config.monqClient.queue(config.notification);
    queue.enqueue("forgot", { to: user.email, token: random }, () =>
      res.jsend(`Email sent successfully to ${user.email}`)
    );
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * This is a function to reset the users password.
 * @param req
 * @param res
 * @returns {*}
 */
async function reset(req, res) {
  try {
    const user = await User.getByResetPasswordToken(
      req.body.resetPasswordToken
    );
    const newPassword = passwordHash.generate(req.body.password);
    user.password = newPassword;
    const savedUser = await user.save();
    return res.jsend(`Password was reset successfully for ${savedUser.email}`);
  } catch (e) {
    return res.jerror(new errors.UpdateUserError(e.message));
  }
}

/**
 * This is a function to verify the users account.
 * @param req
 * @param res
 * @returns {*}
 */
async function verify(req, res) {
  // move to ES6-based bluebird bind
  try {
    const user = await User.getByVerificationToken(req.body.verificationToken);
    const candidateUser = user;
    candidateUser.valid = true;
    candidateUser.verificationToken = null;
    const organisation = await Organisation.findOne({});
    candidateUser.organisation = organisation;
    const verifiedUser = await candidateUser.save();
    return res.jsend(verifiedUser);
  } catch (e) {
    return res.jerror(e);
  }
}

/**
 * This is a function to resend the activation code.
 * @param req
 * @param res
 * @returns {*}
 */
async function resend(req, res) {
  const { email } = req.body;
  try {
    const user = await User.getByEmail(email);
    const userWithToken = await user.generateVerificationToken();
    const queue = config.monqClient.queue(config.notification);
    queue.enqueue(
      "welcome",
      { token: userWithToken.verificationToken, to: userWithToken.email },
      () => res.jsend(`Notification was resent by ${config.notification}`)
    );
  } catch (e) {
    return res.jerror(e);
  }
}

export default { login, getRandomNumber, forgot, reset, verify, resend };
