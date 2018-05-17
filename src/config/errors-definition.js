import errors from "errors";
import config from "./env";

/**
 * A module to define the list of errors managed by the API
 * All the errors extend AtlasAPIError
 * @param name : the name of the error
 * @param code : the error code
 * @param defaultMessage : the error message
 */
export default {
  create: () => {
    errors.stacks(config.env === "development");
    errors.create({
      name: "AtlasAPIError",
      code: 10000,
      defaultMessage: "An error occurred in Atlas API"
    });
    errors.create({
      name: "ObjectNotFound",
      code: 10001,
      defaultMessage: "The object requested was not found.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "InvalidCredentials",
      code: 10002,
      defaultMessage: "Invalid credentials supplied.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "ValidationError",
      code: 10003,
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "RouteNotFoundError",
      code: 10004,
      defaultMessage: "Unknown API route.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "CreateUserError",
      code: 10005,
      defaultMessage: "Cannot create new user.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "UpdateUserError",
      code: 10006,
      defaultMessage: "Cannot update the user.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "NotAllowed",
      code: 10007,
      defaultMessage: "You are not allowed to perform this action.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "CreateExperimentError",
      code: 10008,
      defaultMessage: "Cannot create new experiment.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "UpdateExperimentError",
      code: 10009,
      defaultMessage: "Cannot update experiment.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "CreateOrganisationError",
      code: 10010,
      defaultMessage: "Cannot create new organisation.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "UpdateOrganisationError",
      code: 10011,
      defaultMessage: "Cannot update organisation.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "UploadFileError",
      code: 10012,
      defaultMessage: "Cannot upload sequence file.",
      parent: errors.AtlasAPIError
    });
    errors.create({
      name: "SearchMetadataValuesError",
      code: 10013,
      defaultMessage: "Failed to search in ES.",
      parent: errors.AtlasAPIError
    });
  }
};
