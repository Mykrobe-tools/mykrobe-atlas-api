import keycloakAdmin from "keycloak-admin-client";
import KeyCloakCerts from "get-keycloak-public-key";
import Keycloak from "keycloak-connect";
import axios from "axios";
import qs from "qs";
import httpStatus from "http-status";
import errors from "errors";
import config from "../../config/env";
import APIError from "../helpers/APIError";
import User from "../models/user.model";
import UserJSONTransformer from "../transformers/UserJSONTransformer";

const keycloakConfig = config.accounts.keycloak;

/**
 * Core keycloak confiiguration
 * Admin - used for admin-level operations e.g. create new user
 * Client - used for client-level (all other) operations e.g. reset password email
 *
 */
const adminSettings = keycloakConfig.admin;
const clientSettings = keycloakConfig.client;
/**
 * Core attributes used in various calls
 */
const realm = keycloakConfig.realm;
const tokenUrl = keycloakConfig.tokenUrl;
const redirectUri = keycloakConfig.redirectUri;
/**
 * Connect instance
 */
const connectSettings = {
  realm,
  "auth-server-url": adminSettings.baseUrl,
  "ssl-required": clientSettings.sslRequired,
  "bearer-only": clientSettings.bearerOnly,
  "enable-cors": clientSettings.enableCors,
  resource: clientSettings.clientId,
  credentials: {
    secret: clientSettings.secret
  },
  "confidential-port": 0 // what is this?
};
const connect = new Keycloak({ scope: "openid" }, connectSettings);

// load keycloak certs
const keyCloakCerts = new KeyCloakCerts(
  `${adminSettings.baseUrl}/realms/${realm}/protocol/openid-connect/certs`
);

// get settings that are keycloak ready
const getKeycloakSettings = settings => {
  const keycloakSettings = JSON.parse(JSON.stringify(settings));

  // grantType -> grant_type
  keycloakSettings.grant_type = keycloakSettings.grantType;
  delete keycloakSettings.grantType;

  // clientId -> client_id
  keycloakSettings.client_id = keycloakSettings.clientId;
  delete keycloakSettings.clientId;

  return keycloakSettings;
};

// register new users
const register = async (user, password) => {
  const keycloakUser = {
    enabled: true,
    ...user
  };
  try {
    const client = await keycloakAdmin(getKeycloakSettings(adminSettings));
    const createdUser = await client.users.create(realm, keycloakUser);
    const sendEmail = await client.users.executeActionsEmail(
      realm,
      createdUser.id,
      {
        verifyEmailAction: true,
        redirectUri,
        clientId: clientSettings.clientId
      }
    );
    const resetPassword = await client.users.resetPassword(
      realm,
      createdUser.id,
      {
        value: password
      }
    );
    return createdUser.id;
  } catch (e) {
    const message = e.errorMessage;
    const error = new errors.CreateUserError();
    error.data = { errors: { "": { message } } };

    throw error;
  }
};

// resend verification email
const resend = async id => {
  try {
    const client = await keycloakAdmin(getKeycloakSettings(adminSettings));
    const sendEmail = await client.users.executeActionsEmail(realm, id, {
      verifyEmailAction: true,
      redirectUri,
      clientId: clientSettings.clientId
    });
  } catch (e) {
    const message = e.errorMessage;
    const error = new errors.CreateUserError();
    error.data = { errors: { "": { message } } };

    throw error;
  }
};

// authenticate users
const authenticate = async (username, password) => {
  try {
    const { grantType } = adminSettings;
    const body = qs.stringify({
      username,
      password,
      grant_type: grantType,
      client_id: clientSettings.clientId,
      client_secret: clientSettings.secret,
      scope: "openid"
    });
    const uri = `${adminSettings.baseUrl}/realms/${realm}/${tokenUrl}`;

    const response = await axios.post(uri, body);

    return response.data;
  } catch (e) {
    throw e;
  }
};

// change password
const reset = async id => {
  try {
    const client = await keycloakAdmin(getKeycloakSettings(adminSettings));
    const body = {
      updatePasswordAction: true,
      redirectUri,
      clientId: clientSettings.clientId
    };
    await client.users.executeActionsEmail(realm, id, body);
  } catch (e) {
    throw e;
  }
};

const refreshToken = async data => {
  try {
    const uri = `${adminSettings.baseUrl}/realms/${realm}/${tokenUrl}`;
    const body = {
      refresh_token: data.refreshToken,
      grant_type: "refresh_token",
      client_id: clientSettings.clientId,
      client_secret: clientSettings.secret
    };
    const response = await axios.post(uri, qs.stringify(body));
    return response.data;
  } catch (e) {
    throw e;
  }
};

const getUserByEmail = async email => {
  try {
    const client = await keycloakAdmin(getKeycloakSettings(adminSettings));
    const query = { email };

    const users = await client.users.find(realm, query);
    if (users && users.length) {
      const user = users.shift();
      return user;
    }

    return null;
  } catch (e) {
    throw e;
  }
};

const getUserMiddleware = async (req, res, next) => {
  if (req.kauth && req.kauth.grant && req.kauth.grant.access_token) {
    const accessToken = req.kauth.grant.access_token;
    if (accessToken) {
      const content = accessToken.content;
      if (content) {
        const email = content.email;
        req.email = email;
        const user = await User.getByEmail(email);
        const userJson = new UserJSONTransformer(user).transform();
        req.user = userJson;
      }
    }
  }
  next();
};

connect.accessDenied = (req, res) =>
  res.jerror(new APIError("Not Authorised", httpStatus.UNAUTHORIZED));

const keycloak = Object.freeze({
  register,
  authenticate,
  reset,
  resend,
  refreshToken,
  getUserByEmail,
  connect,
  getUserMiddleware
});

export default keycloak;
