import express from "express";
import mongoose from "mongoose";
import errors from "errors";
import httpStatus from "http-status";
const res = express.response;

/**
 * Override the jsend-express package
 * We use code instead of error name for AtlasAPIError errors
 */

res.jsend = function(data) {
  this.send({ status: "success", data: data });
};

res.jerror = function(error) {
  // check if error is a CarereportAPIError
  if (error instanceof errors.AtlasAPIError || error.data) {
    const errorBody = {
      status: "error",
      code: error.code,
      message: error.message
    };

    if (error.data) {
      errorBody.data = error.data;
    }

    return this.send(errorBody);
  } else if (error instanceof Error) {
    // allow us to pass in Error objects to simplify code elsewhere
    return this.status(error.status || httpStatus.INTERNAL_SERVER_ERROR).send({
      status: "error",
      code: error.name,
      message: error.message
    });
  } else {
    return this.send({ status: "error", data: error });
  }
};
