import Axios from "axios";
import settings from "../settings";

const MAX_ERRORS = 5;


const errorRequests = [];

// special method for handling guesty erros
const handleError = (error, response) => {
  const errorRequest =
    (error && error.message === "Network Error") ||
    (response && response.data.err !== undefined);
  const requestUrl =
    error && error.config ? error.config.url : response.config.url;
  const hadError = errorRequests.find((request) => request.url === requestUrl);
  if (errorRequest && (!hadError || hadError.errors < MAX_ERRORS)) {
    if (hadError) {
      hadError.errors++;
    } else {
      errorRequests.push({ url: requestUrl, errors: 2 });
    }
    return true;
  } else if (errorRequest && hadError.errors >= MAX_ERRORS) {
    clearErrorOnComplete(error || response);
    return false;
  }
  return false;
};

// special method for handling guesty erros
const clearErrorOnComplete = (response) => {
  const hadError = errorRequests.findIndex(
    (request) => request.url === response.config.url
  );

  if (hadError > -1) {
    errorRequests.splice(hadError, 1);
  }
};

Axios.interceptors.response.use(
  function (response) {
    if (response && response.config.url.includes(settings.guestyApiUrl)) {
      if (handleError(undefined, response)) {
        // repeat request if response returns 200, but object err: {} is passed
        return Axios.request(response.config);
      }
      if (response.data.err === undefined) {
        clearErrorOnComplete(response);
      }
    }
    return response;
  },
  function (error) {
    if (
      error.response &&
      error.response.config.url.includes(settings.guestyApiUrl)
    ) {
      if (handleError(error)) {
        // repeat request if response returns message "Network Error" - guesty does not return 5** code
        return Axios.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
