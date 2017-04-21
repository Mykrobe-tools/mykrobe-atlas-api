import Joi from 'joi';
import config from './env';

export default {
  // POST /users
  createUser: {
    body: {
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      password: config.usePassword() ? Joi.string().required() : Joi.string().optional(),
      phone: config.usePassword() ? Joi.string().optional() : Joi.string().required(),
      email: config.usePassword() ? Joi.string().email().required() :
          Joi.string().email().optional()
    }
  },

  // UPDATE /users/:id
  updateUser: {
    params: {
      id: Joi.string().hex().required()
    },
    body: {
      firstname: Joi.string(),
      lastname: Joi.string(),
      email: config.usePassword() ? Joi.string() : Joi.string().allow('').allow(null),
      phone: config.usePassword() ? Joi.string().allow('').allow(null) : Joi.string()
    }
  },

  // POST /auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // POST /auth/forgot
  forgotPassword: {
    body: {
      email: Joi.string().email().required()
    }
  },

  // POST /auth/reset
  resetPassword: {
    body: {
      resetPasswordToken: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // POST /auth/resend
  resendNotification: {
    body: {
      email: config.usePassword() ? Joi.string().required() : Joi.string().optional(),
      phone: config.usePassword() ? Joi.string().optional() : Joi.string().required()
    }
  },

  // POST /auth/verify
  verifyAccount: {
    body: {
      verificationToken: Joi.string().required(),
      phone: config.usePassword() ? Joi.string().optional() : Joi.string().required()
    }
  },

  // POST /experiments
  createExperiment: {
    body: {
      organisation: Joi.object({
        name: Joi.string().required()
      })
    }
  },

  // PUT /experiments/:id/file
  uploadFile: {
    params: {
      id: Joi.string().hex().required()
    },
    body: {
      path: Joi.string(),
      provider: Joi.string().valid('dropbox', 'box', 'googleDrive', 'oneDrive')
    }
  }
};
