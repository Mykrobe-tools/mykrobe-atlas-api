const loginSchema = {
  $id: "https://api.atlas-dev.makeandship.com/schemas/login.json",
  type: "object",
  $schema: "http://json-schema.org/draft-07/schema#",
  properties: {
    email: {
      type: "string",
      format: "email"
    },
    password: { type: "string" }
  },
  required: ["email", "password"]
};

export default loginSchema;
