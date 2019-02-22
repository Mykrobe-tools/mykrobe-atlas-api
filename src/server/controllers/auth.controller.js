import jwt from "jsonwebtoken";
import passwordHash from "password-hash";
import errors from "errors";
import httpStatus from "http-status";
import randomstring from "randomstring";
import User from "../models/user.model";
import Organisation from "../models/organisation.model";
import APIError from "../helpers/APIError";
import AccountsHelper from "../helpers/AccountsHelper";

import config from "../../config/env";
import MonqHelper from "../helpers/MonqHelper";

const keycloak = AccountsHelper.keycloakInstance();

/**
 * Returns jwt token if valid email and password is provided
 * @param req
 * @param res
 * @returns {*}
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await keycloak.authenticate(email, password);
    return res.jsend(data);
  } catch (e) {
    return res.jerror(new APIError(e.message, httpStatus.UNAUTHORIZED));
  }
};

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
const getRandomNumber = (req, res) => {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.jsend({
    user: req.user,
    num: Math.random() * 100
  });
};

/**
 * This is a function to generate the token and send email.
 * @param req
 * @param res
 * @returns {*}
 */
const forgot = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.getByEmail(email);

    let keycloakId = null;

    if (!user.hasOwnProperty("keycloakId")) {
      // lookup
      const keycloakUser = await keycloak.getUserByEmail(email);
      if (keycloakUser) {
        keycloakId = keycloakUser.id;
        user.keycloakId = keycloakId;
        const savedUser = await user.save();
      } else {
        return res.jerror(new errors.UpdateUserError(`Unable to find user with email ${email}`));
      }
    } else {
      keycloakId = user.keycloakId;
    }
    await keycloak.reset(keycloakId);
    return res.jsend(`Email sent successfully to ${user.email}`);
  } catch (e) {
    return res.jerror(new errors.UpdateUserError(e.message));
  }
};

const resend = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.getByEmail(email);

    let keycloakId = null;

    if (!user.hasOwnProperty("keycloakId")) {
      // lookup
      const keycloakUser = await keycloak.getUserByEmail(email);
      if (keycloakUser) {
        keycloakId = keycloakUser.id;
        user.keycloakId = keycloakId;
        const savedUser = await user.save();
      } else {
        return res.jerror(new errors.UpdateUserError(`Unable to find user with email ${email}`));
      }
    } else {
      keycloakId = user.keycloakId;
    }
    await keycloak.resend(keycloakId);
    return res.jsend(`Email sent successfully to ${user.email}`);
  } catch (e) {
    return res.jerror(new errors.UpdateUserError(e.message));
  }
};

const refresh = async (req, res) => {
  try {
    const data = await keycloak.refreshToken(req.body);
    return res.jsend(data);
  } catch (e) {
    return res.jerror(new APIError(e.message, httpStatus.UNAUTHORIZED));
  }
};

export default { login, getRandomNumber, forgot, refresh, resend };
