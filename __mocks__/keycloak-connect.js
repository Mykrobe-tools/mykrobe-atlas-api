import winston from "winston";
import httpStatus from "http-status";

import { APIError } from "makeandship-api-common/lib/modules/error";

import Constants from "../src/server/Constants";

const setup = (request, response, next) => {
  request.kauth = {};
  next();
};

const verifyToken = (request, response, next) => {
  const auth = request.headers.authorization;
  if (auth && auth.startsWith("Bearer ") && auth.length > 100) {
    return validToken(request, response, auth, next);
  } else if (auth) {
    return accessDenied(request, response, next);
  } else {
    next();
  }
};

const accessDenied = (req, res) =>
  res.jerror(
    new APIError(Constants.ERRORS.NOT_ALLOWED, "Not Authorised", null, httpStatus.UNAUTHORIZED)
  );

const validToken = (request, response, auth, next) => {
  const adminToken =
    "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTLUVoTEVSSzl4UXczNWM1QkY2UmFaOUR0Vk9wdTY4ZUVieXZZN1E2OXdvIn0.eyJqdGkiOiJlN2MwMTBiNS1hNjU1LTRiMjMtYjgyYi1kM2E5MTA2NmIzMWMiLCJleHAiOjE1Mjg5Njg4NTIsIm5iZiI6MCwiaWF0IjoxNTI4OTY4NTUyLCJpc3MiOiJodHRwczovL2FjY291bnRzLm1ha2VhbmRzaGlwLmNvbS9hdXRoL3JlYWxtcy9jYXJlcmVwb3J0IiwiYXVkIjoiY2FyZXJlcG9ydC1hcHAiLCJzdWIiOiIyMjA0NDFhZS01N2U5LTRhNmEtOTU1MS0zYjk2YTQ1ZDE3MzIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJjYXJlcmVwb3J0LWFwcCIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6IjI4ZmJkMjVmLTBiZTgtNGRkYi05MWUyLTk2MDBkNWJhZThjMCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOltdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJuYW1lIjoiWWFzc2lyZSBFbGhhbmkiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJ5YXNzaXJlQG1ha2VhbmRzaGlwLmNvbSIsImdpdmVuX25hbWUiOiJZYXNzaXJlIiwiZmFtaWx5X25hbWUiOiJFbGhhbmkiLCJlbWFpbCI6Inlhc3NpcmVAbWFrZWFuZHNoaXAuY29tIn0.cdKo03xWKXrUyvBZdzgMsIF1_lv57_2u3xfjvBVZAwCu6JaXvYloUnZ99X-z4vGeBLU7Ictcp8_H8GBlZb4XRstEmDy2rbPWRES5rqY5RQobRt_wckdelxdidp-j5PInaD8vXSuu_VThbNaTSIWkhGdxUkwAbJ17k2BCH_8_HuJvWBh3fF9SBxxPSCmr7GftAfx12wOVk_0ucvb_R7qlY6NdM5MMseA5OPdHJ-TJWObuuCLxfZ76LAeu8M8YXZvvVm7fNpF8Z9ngjZ48lZLXpwrTFjtleObrhnXcZwx5CsG3vL2DK2TnojxGgnpOWRgjhfCTFlOHeVWA3x6Nr42A1A";
  let email;
  if (auth === `Bearer ${adminToken}`) {
    email = "admin@nhs.co.uk";
  } else {
    email = "thomas.carlos@nhs.net";
  }
  request.kauth = {
    grant: {
      access_token: {
        token:
          "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTLUVoTEVSSzl4UXczNWM1QkY2UmFaOUR0Vk9wdTY4ZUVieXZZN1E2OXdvIn0.eyJqdGkiOiIwNmYyZWNmNi03ZmFlLTQxZTctYjc3Zi0zMWVjOGYwYWMzMWEiLCJleHAiOjE1Mjg5MDM1MjksIm5iZiI6MCwiaWF0IjoxNTI4OTAzMjI5LCJpc3MiOiJodHRwczovL2FjY291bnRzLm1ha2VhbmRzaGlwLmNvbS9hdXRoL3JlYWxtcy9jYXJlcmVwb3J0IiwiYXVkIjoiY2FyZXJlcG9ydC1hcHAiLCJzdWIiOiIzZTExMmM4Ny1mODBjLTQ3MDgtYjdhMi00YzNhZGVhNDYzYzYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJjYXJlcmVwb3J0LWFwcCIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6ImI1NTE0YzdlLThhZGUtNDNkYS1hMGYwLTRkMGI3MWU5NzMwZCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOltdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJuYW1lIjoiTWFyayBUaG9tc2l0IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0BtYWtlYW5kc2hpcC5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiVGhvbXNpdCIsImVtYWlsIjoibWFya0BtYWtlYW5kc2hpcC5jb20ifQ.BNRfmpCVM6c0sPq_6ySMZpliBb_PImu5_nheAGR9VfvEq9Vyw0wtm1IQv6yFtMs3K_w1gPATKUq32KaWNSqdN4IOEPZOdqUJXy5vYTGYxi5vXUlGIavYiue5UvY9uzFiZEvEhw7A6QmrQDpYZcTO5Flb0rQezKq7r-tMMmVXGFp7AgWLLPzWAY9QkSg062aWDvJB28rSemIm_4-GD30OYLGshXni9HrjvK7H6bq8RlxqPJDAJ0hH-gIItuB0c1x2aGs3jm1rd5mgo0lqetYOM1uIc9OI6ya5JMIL3zvHHvzi_7UQFAquLRXJp06NqVVPJlqjH7thEIrfdZXAl-8I8A",
        clientId: "atlas-app",
        header: {
          alg: "RS256",
          typ: "JWT",
          kid: "S-EhLERK9xQw35c5BF6RaZ9DtVOpu68eEbyvY7Q69wo"
        },
        content: {
          jti: "06f2ecf6-7fae-41e7-b77f-31ec8f0ac31a",
          exp: 1528903529,
          nbf: 0,
          iat: 1528903229,
          iss: "https://accounts.makeandship.com/auth/realms/atlas",
          aud: "atlas-app",
          sub: "3e112c87-f80c-4708-b7a2-4c3adea463c6",
          typ: "Bearer",
          azp: "atlas-app",
          auth_time: 0,
          session_state: "b5514c7e-8ade-43da-a0f0-4d0b71e9730d",
          acr: "1",
          "allowed-origins": [],
          realm_access: { roles: ["uma_authorization"] },
          resource_access: {
            account: {
              roles: ["manage-account", "manage-account-links", "view-profile"]
            }
          },
          name: "David Robin",
          preferred_username: email,
          given_name: "David",
          family_name: "Robin",
          email
        },
        signature: {
          type: "Buffer",
          data: [
            4,
            212,
            95,
            154,
            144,
            149,
            51,
            167,
            52,
            176,
            250,
            191,
            235,
            36,
            140,
            102,
            153,
            98,
            5,
            191,
            207,
            34,
            107,
            185,
            254,
            120,
            94,
            0,
            100,
            125,
            85,
            251,
            196,
            171,
            213,
            114,
            195,
            76,
            45,
            155,
            82,
            16,
            191,
            172,
            133,
            180,
            203,
            55,
            43,
            252,
            53,
            128,
            240,
            19,
            41,
            74,
            183,
            216,
            166,
            150,
            53,
            42,
            157,
            55,
            130,
            14,
            16,
            246,
            78,
            118,
            165,
            9,
            95,
            46,
            111,
            97,
            49,
            152,
            198,
            46,
            111,
            93,
            73,
            70,
            33,
            171,
            216,
            138,
            231,
            185,
            82,
            246,
            61,
            187,
            49,
            98,
            100,
            75,
            196,
            135,
            14,
            192,
            233,
            9,
            171,
            64,
            58,
            88,
            101,
            196,
            206,
            228,
            89,
            91,
            210,
            180,
            30,
            204,
            170,
            187,
            175,
            235,
            76,
            50,
            101,
            87,
            24,
            90,
            123,
            2,
            5,
            139,
            44,
            252,
            214,
            1,
            143,
            80,
            145,
            40,
            52,
            235,
            102,
            150,
            14,
            242,
            65,
            219,
            202,
            210,
            122,
            98,
            38,
            255,
            143,
            134,
            15,
            125,
            14,
            96,
            177,
            172,
            133,
            121,
            226,
            244,
            122,
            227,
            188,
            174,
            199,
            233,
            186,
            188,
            70,
            92,
            106,
            60,
            144,
            192,
            39,
            72,
            71,
            250,
            2,
            8,
            182,
            224,
            116,
            115,
            92,
            118,
            104,
            107,
            55,
            142,
            109,
            107,
            119,
            153,
            160,
            163,
            73,
            106,
            122,
            214,
            14,
            51,
            91,
            136,
            115,
            211,
            136,
            235,
            38,
            185,
            36,
            194,
            11,
            223,
            59,
            199,
            30,
            252,
            226,
            255,
            181,
            16,
            20,
            10,
            174,
            45,
            21,
            201,
            167,
            78,
            141,
            169,
            85,
            79,
            38,
            90,
            163,
            31,
            187,
            97,
            16,
            138,
            223,
            117,
            149,
            192,
            151,
            239,
            8,
            240
          ]
        },
        signed:
          "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTLUVoTEVSSzl4UXczNWM1QkY2UmFaOUR0Vk9wdTY4ZUVieXZZN1E2OXdvIn0.eyJqdGkiOiIwNmYyZWNmNi03ZmFlLTQxZTctYjc3Zi0zMWVjOGYwYWMzMWEiLCJleHAiOjE1Mjg5MDM1MjksIm5iZiI6MCwiaWF0IjoxNTI4OTAzMjI5LCJpc3MiOiJodHRwczovL2FjY291bnRzLm1ha2VhbmRzaGlwLmNvbS9hdXRoL3JlYWxtcy9jYXJlcmVwb3J0IiwiYXVkIjoiY2FyZXJlcG9ydC1hcHAiLCJzdWIiOiIzZTExMmM4Ny1mODBjLTQ3MDgtYjdhMi00YzNhZGVhNDYzYzYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJjYXJlcmVwb3J0LWFwcCIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6ImI1NTE0YzdlLThhZGUtNDNkYS1hMGYwLTRkMGI3MWU5NzMwZCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOltdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJuYW1lIjoiTWFyayBUaG9tc2l0IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0BtYWtlYW5kc2hpcC5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiVGhvbXNpdCIsImVtYWlsIjoibWFya0BtYWtlYW5kc2hpcC5jb20ifQ"
      },
      __raw:
        '{"access_token":"eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJTLUVoTEVSSzl4UXczNWM1QkY2UmFaOUR0Vk9wdTY4ZUVieXZZN1E2OXdvIn0.eyJqdGkiOiIwNmYyZWNmNi03ZmFlLTQxZTctYjc3Zi0zMWVjOGYwYWMzMWEiLCJleHAiOjE1Mjg5MDM1MjksIm5iZiI6MCwiaWF0IjoxNTI4OTAzMjI5LCJpc3MiOiJodHRwczovL2FjY291bnRzLm1ha2VhbmRzaGlwLmNvbS9hdXRoL3JlYWxtcy9jYXJlcmVwb3J0IiwiYXVkIjoiY2FyZXJlcG9ydC1hcHAiLCJzdWIiOiIzZTExMmM4Ny1mODBjLTQ3MDgtYjdhMi00YzNhZGVhNDYzYzYiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJjYXJlcmVwb3J0LWFwcCIsImF1dGhfdGltZSI6MCwic2Vzc2lvbl9zdGF0ZSI6ImI1NTE0YzdlLThhZGUtNDNkYS1hMGYwLTRkMGI3MWU5NzMwZCIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOltdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJuYW1lIjoiTWFyayBUaG9tc2l0IiwicHJlZmVycmVkX3VzZXJuYW1lIjoibWFya0BtYWtlYW5kc2hpcC5jb20iLCJnaXZlbl9uYW1lIjoiTWFyayIsImZhbWlseV9uYW1lIjoiVGhvbXNpdCIsImVtYWlsIjoibWFya0BtYWtlYW5kc2hpcC5jb20ifQ.BNRfmpCVM6c0sPq_6ySMZpliBb_PImu5_nheAGR9VfvEq9Vyw0wtm1IQv6yFtMs3K_w1gPATKUq32KaWNSqdN4IOEPZOdqUJXy5vYTGYxi5vXUlGIavYiue5UvY9uzFiZEvEhw7A6QmrQDpYZcTO5Flb0rQezKq7r-tMMmVXGFp7AgWLLPzWAY9QkSg062aWDvJB28rSemIm_4-GD30OYLGshXni9HrjvK7H6bq8RlxqPJDAJ0hH-gIItuB0c1x2aGs3jm1rd5mgo0lqetYOM1uIc9OI6ya5JMIL3zvHHvzi_7UQFAquLRXJp06NqVVPJlqjH7thEIrfdZXAl-8I8A"}'
    }
  };
  next();
};

class Keycloak {
  getGrant(request, response) {}
  protect() {
    return function protect(request, response, next) {
      if (request.kauth && request.kauth.grant) {
        return next();
      }
      accessDenied(request, response, next);
    };
  }

  middleware() {
    const middlewares = [];

    middlewares.push(setup);
    middlewares.push(verifyToken);

    return middlewares;
  }
}

export default Keycloak;
