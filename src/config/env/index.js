import commonApi from "makeandship-api-common";
import deepmerge from "deepmerge";

import accounts from "../accounts";
import communications from "../communications";
import elasticsearch from "../elasticsearch";
import express from "../express";
import services from "../services";
import logging from "../logging";

import development from "./development";
import test from "./test";
import production from "./production";

// common configuration across all projects
const commonConfig = commonApi.config;

// common configuration across all environmentts for this project
const appConfig = {
  accounts,
  communications,
  elasticsearch,
  services,
  express,
  logging
};

// per environment config for this project
const environments = {
  development,
  test,
  production
};
const environment = process.env.NODE_ENV || "development";
const environmentAppConfig = environments[environment];
environmentAppConfig.env = environment;

const config = deepmerge.all([commonConfig, appConfig, environmentAppConfig]);

export default config;
