export default {
  admin: {
    baseUrl: "https://accounts-dev.makeandship.com/auth",
    username: "admin",
    password: "#9YtwJe=.WH/&ZkV",
    grantType: "password",
    clientId: "admin-cli", // use for admin-level operations e.g. register new user
    realmName: "master"
  },
  client: {
    clientId: "atlas-app", // use for app-level operations e.g. reset password email
    secret: "7f4450b3-01bf-4101-8eae-a286e633b7a9",
    enableCors: true,
    bearerOnly: true,
    sslRequired: "all"
  },
  realm: "atlas",
  tokenUrl: "protocol/openid-connect/token"
};
