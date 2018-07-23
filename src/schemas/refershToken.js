const refreshTokenSchema = {
  $id: "https://api.atlas-dev.makeandship.com/schemas/refreshToken.json",
  type: "object",
  $schema: "http://json-schema.org/draft-07/schema#",
  properties: {
    refreshToken: {
      type: "string"
    }
  },
  required: ["refreshToken"]
};

export default refreshTokenSchema;
