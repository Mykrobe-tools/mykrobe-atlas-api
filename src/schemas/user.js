const userSchema = {
  $id: "https://api.atlas-dev.makeandship.com/schemas/user.json",
  type: "object",
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    Avatar: {
      type: ["object", "null"],
      title: "Avatar",
      properties: {
        url: {
          title: "URL",
          type: "string",
          format: "uri"
        },
        width: {
          title: "Width",
          type: "integer"
        },
        height: {
          title: "Width",
          type: "integer"
        }
      },
      required: ["url", "width", "height"]
    }
  },
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
    role: {
      type: "string"
    },
    phone: {
      type: "string"
    },
    email: {
      type: "string",
      minLength: 1,
      format: "email"
    },
    resetPasswordToken: {
      type: ["string", "null"]
    },
    verificationToken: {
      type: ["string", "null"]
    },
    valid: {
      type: "boolean"
    },
    avatar: {
      type: "array",
      title: "The users avatars",
      items: {
        $ref: "#/definitions/Avatar"
      }
    }
  },
  required: ["firstname", "lastname", "email"]
};

export default userSchema;
