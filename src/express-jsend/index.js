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

res.jerror = function(code, message) {
  // check if error is a AtlasAPIError
  if (code instanceof errors.AtlasAPIError) {
    this.send({ status: "error", code: code.code, message: code.message });
    return;
  }
  if (code instanceof Error) {
    // allow us to pass in Error objects to simplify code elsewhere
    this.status(code.status || httpStatus.INTERNAL_SERVER_ERROR).send({
      status: "error",
      code: code.name,
      message: code.message
    });
    return;
  }
  this.send({ status: "error", data: code });
};
