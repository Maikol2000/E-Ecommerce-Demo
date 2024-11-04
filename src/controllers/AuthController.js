const AuthService = require("../services/AuthService");
const JwtService = require("../services/JwtService");
const UserService = require("../services/UserService");
const { validateRequiredInput } = require("../utils");
const { CONFIG_MESSAGE_ERRORS } = require("../configs");
const ErrorResponse = require("../core/ErrorResponse");
const User = require("../models/UserModel");
const SuccessResponse = require("../core/SuccressResponse");

const registerUser = async (req, res, next) => {
  const { email, password } = req.body;
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const REGEX_PASSWORD =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const isCheckEmail = REGEX_EMAIL.test(email);
  const isCheckPassword = REGEX_PASSWORD.test(password);

  const requiredFields = validateRequiredInput(req.body, ["email", "password"]);
  if (requiredFields?.length) {
    return next(
      new ErrorResponse(
        `The field ${requiredFields.join(", ")} is required`,
        CONFIG_MESSAGE_ERRORS.INVALID.status,
        CONFIG_MESSAGE_ERRORS.INVALID.type,
        "Error"
      )
    );
  }
  if (!isCheckEmail) {
    return next(
      new ErrorResponse(
        "The field must a email",
        CONFIG_MESSAGE_ERRORS.INVALID.status,
        CONFIG_MESSAGE_ERRORS.INVALID.type,
        "INVALID"
      )
    );
  }
  if (!isCheckPassword) {
    return next(
      new ErrorResponse(
        "The password must be at least 6 characters long and include uppercase letters, lowercase letters, numbers, and special characters.",
        CONFIG_MESSAGE_ERRORS.INVALID.status,
        CONFIG_MESSAGE_ERRORS.INVALID.type,
        "Error"
      )
    );
  }

  const existedUser = await User.findOne({
    email: email,
  }).lean();

  if (existedUser) {
    return next(
      new ErrorResponse(
        "The email of user is existed",
        CONFIG_MESSAGE_ERRORS.ALREADY_EXIST.status,
        CONFIG_MESSAGE_ERRORS.ALREADY_EXIST.type,
        "Error"
      )
    );
  }

  const response = await AuthService.registerUser(req.body);
  const { data, status, message, statusMessage, typeError } = response;

  if (typeError) {
    return next(new ErrorResponse(message, status, typeError, statusMessage));
  } else {
    new SuccessResponse(status, message, statusMessage, data).send(res);
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const REGEX_PASSWORD =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  const isCheckEmail = REGEX_EMAIL.test(email);
  const isCheckPassword = REGEX_PASSWORD.test(password);
  const requiredFields = validateRequiredInput(req.body, ["email", "password"]);

  if (requiredFields?.length) {
    return next(
      new ErrorResponse(
        `The field ${requiredFields.join(", ")} is required`,
        CONFIG_MESSAGE_ERRORS.INVALID.status,
        CONFIG_MESSAGE_ERRORS.INVALID.type,
        "Error"
      )
    );
  }
  if (!isCheckEmail) {
    return next(
      new ErrorResponse(
        "The field must a email",
        CONFIG_MESSAGE_ERRORS.INVALID.status,
        CONFIG_MESSAGE_ERRORS.INVALID.type,
        "INVALID"
      )
    );
  }
  if (!isCheckPassword) {
    return next(
      new ErrorResponse(
        "The password must be at least 6 characters long and include uppercase letters, lowercase letters, numbers, and special characters.",
        CONFIG_MESSAGE_ERRORS.INVALID.status,
        CONFIG_MESSAGE_ERRORS.INVALID.type,
        "INVALID"
      )
    );
  }
  const response = await AuthService.loginUser(req.body);
  const {
    data,
    status,
    message,
    statusMessage,
    access_token,
    refresh_token,
    typeError,
  } = response;

  if (typeError) {
    return next(new ErrorResponse(message, status, typeError, statusMessage));
  }

  // 165 days
  const expRefTokenCookie = new Date(Date.now() + 165 * 24 * 60 * 60 * 1000);
  // 1 day
  const expAccTokenCookie = new Date(Date.now() + 24 * 60 * 60 * 1000);

  res.cookie("refresh_token", refresh_token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
    expires: expRefTokenCookie,
  });
  res.cookie("access_token", access_token, {
    httpOnly: true,
    secure: false,
    path: "/",
    expires: expAccTokenCookie,
  });

  const dataResp = {
    user: data,
    access_token,
    refresh_token,
  };

  new SuccessResponse(status, message, statusMessage, dataResp).send(res);
};

const refreshToken = async (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];
  if (!token) {
    return next(
      new ErrorResponse(
        "Unauthorized",
        CONFIG_MESSAGE_ERRORS.INVALID.status,
        CONFIG_MESSAGE_ERRORS.UNAUTHORIZED.type,
        "Error"
      )
    );
  }
  const response = await JwtService.refreshTokenJwtService(token);
  const {
    data,
    status: statusCode,
    typeError,
    message,
    statusMessage,
  } = response;

  if (typeError != CONFIG_MESSAGE_ERRORS.ACTION_SUCCESS.type) {
    return next(
      new ErrorResponse(message, statusCode, typeError, statusMessage)
    );
  } else {
    new SuccessResponse(statusCode, message, statusMessage, data).send(res);
  }
};

const logoutUser = async (req, res) => {
  const accessToken = req.headers?.authorization?.split(" ")[1];
  const response = await AuthService.logoutUser(res, accessToken);
  const { data, status, message, statusMessage } = response;
  new SuccessResponse(status, message, statusMessage, data).send(res);
};

const getAuthMe = async (req, res) => {
  try {
    const userId = req.userId;
    const response = await UserService.getDetailsUser(userId);
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

const updateAuthMe = async (req, res) => {
  try {
    const userId = req.userId;
    const isPermission = req.isPermission;
    const response = await AuthService.updateAuthMe(
      userId,
      req.body,
      isPermission
    );
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

const changePasswordMe = async (req, res) => {
  try {
    const userId = req.userId;
    const newPassword = req.body.newPassword;
    const currentPassword = req.body.currentPassword;
    const requiredFields = validateRequiredInput(
      { currentPassword, newPassword },
      ["currentPassword", "newPassword"]
    );
    const accessToken = req?.headers?.authorization?.split(" ")[1];
    if (requiredFields?.length) {
      return res.status(CONFIG_MESSAGE_ERRORS.INVALID.status).json({
        status: "Error",
        typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
        message: `The field ${requiredFields.join(", ")} is required`,
      });
    }
    const response = await AuthService.changePasswordMe(
      userId,
      { newPassword, currentPassword },
      res,
      accessToken
    );
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    console.log("e", e);
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

const forgotPasswordMe = async (req, res) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(CONFIG_MESSAGE_ERRORS.INVALID.status).json({
        status: "Error",
        typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
        message: `The field email is required`,
        data: null,
      });
    }
    const response = await AuthService.forgotPasswordMe(email);
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    console.log("e", e);
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

const resetPasswordMe = async (req, res) => {
  try {
    const { secretKey, newPassword } = req.body;
    const requiredFields = validateRequiredInput({ secretKey, newPassword }, [
      "secretKey",
      "newPassword",
    ]);
    if (requiredFields?.length) {
      return res.status(CONFIG_MESSAGE_ERRORS.INVALID.status).json({
        status: "Error",
        typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
        message: `The field ${requiredFields.join(", ")} is required`,
      });
    }

    const response = await AuthService.resetPasswordMe(secretKey, newPassword);
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    console.log("e", e);
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

const registerGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (idToken) {
      return res.status(CONFIG_MESSAGE_ERRORS.INVALID.status).json({
        status: "Error",
        typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
        message: `The idToken is required`,
      });
    }

    const response = await AuthService.registerGoogle(idToken);
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

const loginGoogle = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (idToken) {
      return res.status(CONFIG_MESSAGE_ERRORS.INVALID.status).json({
        status: "Error",
        typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
        message: `The idToken is required`,
      });
    }

    const response = await AuthService.registerGoogle(idToken);
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

const registerFacebook = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(CONFIG_MESSAGE_ERRORS.INVALID.status).json({
        status: "Error",
        typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
        message: `The field idToken is required`,
      });
    }

    const response = await AuthService.registerFacebook(req.body);
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

const loginFacebook = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(CONFIG_MESSAGE_ERRORS.INVALID.status).json({
        status: "Error",
        typeError: CONFIG_MESSAGE_ERRORS.INVALID.type,
        message: `The field idToken is required`,
      });
    }

    const response = await AuthService.loginFacebook(req.body);
    const { data, status, typeError, message, statusMessage } = response;
    return res.status(status).json({
      typeError,
      data,
      message,
      status: statusMessage,
    });
  } catch (e) {
    return res.status(CONFIG_MESSAGE_ERRORS.INTERNAL_ERROR.status).json({
      typeError: "Internal Server Error",
      data: null,
      status: "Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getAuthMe,
  updateAuthMe,
  changePasswordMe,
  forgotPasswordMe,
  resetPasswordMe,
  registerGoogle,
  registerFacebook,
  loginGoogle,
  loginFacebook,
};
