import Axios from "axios";
import settings from '../settings';

const getAuthHeader = () => {
    const username = process.env.REACT_APP_USERNAME;
    const password = process.env.REACT_APP_PASSWORD;
    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
  return "Basic " + encodedCredentials;
};

if (process.env.NODE_ENV !== "production") {
    Axios.interceptors.request.use(
        (config) => {
            if (
                config &&
                (
                    config.url.includes(settings.frankPorterApiUrl) ||
                    config.url.includes(settings.frankPorterPayUrl)
                )
            ) {
                config.headers.Authorization = getAuthHeader();
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
}
