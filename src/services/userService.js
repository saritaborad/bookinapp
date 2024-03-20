import Axios from "axios";
import settings from "../settings";
import { authService } from "./authService";

export default class UserService {
  sendContactEmail(name, email, subject, message, lang) {
    const data = this.prepareSendEmailData(
      `${name} (${email})`,
      subject,
      message,
      lang,
      email
    );

    return new Promise((resolve, reject) => {
      return this.contactPost(data)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
  prepareSendEmailData(fullName, subject, body, lang, email) {
    return `full_name=${fullName}&subject=${subject}&message=${body}&source=booking_site&target_location=${lang}&owner_email_id=${email}`;
  }

  contactPost(data) {
    return Axios.post(
      `${settings.frankPorterApiUrl}/owner/api/owner_api/send_contact_mail`,
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authService.getBasicAuth(),
        },
      }
    );
  }
}

export const userService = new UserService();
