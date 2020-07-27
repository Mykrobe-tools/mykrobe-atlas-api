import logger from "../src/server/modules/logger";

const create = (realm, keycloakUser) => {
  logger.log("debug", "keycloak-admin-client#create");
  const timestamp = new Date().getTime();
  return {
    id: "18562b88-eaed-4d9b-9e5f-35535557b676",
    createdTimestamp: timestamp,
    username: keycloakUser.email,
    enabled: true,
    totp: false,
    emailVerified: false,
    firstName: keycloakUser.firstName,
    lastName: keycloakUser.lastName,
    email: keycloakUser.email,
    attributes: {
      modifyTimestamp: [`${timestamp}Z`],
      createTimestamp: [`${timestamp}Z`]
    },
    disableableCredentialTypes: [],
    requiredActions: [],
    notBefore: 0,
    access: {
      manageGroupMembership: true,
      view: true,
      mapRoles: true,
      impersonate: true,
      manage: true
    }
  };
};
const executeActionsEmail = (realm, id, body) => {
  logger.debug("keycloak-admin-client#executeActionsEmail");
};
const resetPassword = (realm, id, body) => {
  logger.debug("keycloak-admin-client#resetPassword");
};

const find = (realm, query) => {
  const timestamp = new Date().getTime();
  return [
    {
      id: "18562b88-eaed-4d9b-9e5f-35535557b676",
      createdTimestamp: timestamp,
      username: query.email,
      enabled: true,
      totp: false,
      emailVerified: false,
      firstName: "Steven",
      lastName: "Waston",
      email: query.email,
      attributes: {
        modifyTimestamp: [`${timestamp}Z`],
        createTimestamp: [`${timestamp}Z`]
      },
      disableableCredentialTypes: [],
      requiredActions: [],
      notBefore: 0,
      access: {
        manageGroupMembership: true,
        view: true,
        mapRoles: true,
        impersonate: true,
        manage: true
      }
    }
  ];
};

const admin = settings => {
  return {
    users: {
      create,
      find,
      executeActionsEmail,
      resetPassword
    }
  };
};

export default admin;
