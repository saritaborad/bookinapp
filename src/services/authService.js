import settings from "../settings";

export default class AuthService {
  getBasicAuth() {
    return (
      "Basic " +
      new Buffer(settings.apiUsername + ":" + settings.apiPassword).toString(
        "base64"
      )
    );
  }

  setAdmin() {
    localStorage.setItem("isAdmin", true);
  }

  isAdmin() {
    return localStorage.getItem("isAdmin");
  }
}

export const authService = new AuthService();
