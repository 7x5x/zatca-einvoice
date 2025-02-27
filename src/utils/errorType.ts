import { logger } from "../logger";


export const throwErrorObject = (errorObject: any, log: boolean = true): never => {
  log && logError(errorObject);
  throw errorObject;
};

export const logError = (errorObject: any): void => {
  const { Statcode, message } = errorObject;
  const level = Statcode === 202 ? "Warning" : "Error";
  logger(
    level,
    "clearanceInvoice ",
    ` ${Statcode || 500} : ${message || level}` || "An error occurred"
  );
};
