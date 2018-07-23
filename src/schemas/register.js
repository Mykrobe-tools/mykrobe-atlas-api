const userSchema = {
  $id: "https://api.atlas-dev.makeandship.com/schemas/user.json",
  type: "object",
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {},
  properties: {
    firstname: {
      type: "string",
      minLength: 1
    },
    lastname: {
      type: "string",
      minLength: 1
    },
    password: {
      type: "string",
      minLength: 1
    },
    phone: {
      type: "string"
    },
    email: {
      type: "string",
      minLength: 1,
      format: "email"
    }
  },
  required: ["firstname", "lastname", "email", "password"]
};

export default userSchema;
