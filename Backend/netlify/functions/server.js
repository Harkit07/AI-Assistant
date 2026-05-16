const serverless = require("serverless-http");

let appHandler;

const getApp = async () => {
  if (!appHandler) {
    const { default: app } = await import("../../server.js");
    appHandler = serverless(app);
  }
  return appHandler;
};

exports.handler = async (event, context) => {
  const handler = await getApp();
  return handler(event, context);
};
