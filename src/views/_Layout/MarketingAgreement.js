import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { storageService } from "../../services/storageService";
import settings from "../../settings";
import "./MarketingAgreement.scss";
import {checkForArabic} from "../../helpers/arabicLangValidator";

class MarketingAgreement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      accepted: localStorage.getItem(settings.marketingAgreement),
    };
  }

  setAgreement(value) {
    this.setState({ accepted: value });
    storageService.setAgreement(value);
  }

  render() {
    const { t } = this.props;
    return (
      <div
        className={
          "marketing-agreement-container" +
          (this.state.accepted !== null ? " hidden" : "") + 
          checkForArabic(" arabic-marketing-agreement-container")
        }
      >
        <div>
          {t("marketingCookiesText")}{" "}
          <Link to="/privacy-policy">{t("privacyPolicyText")}</Link>
        </div>
        <div className="buttons">
          <button onClick={this.setAgreement.bind(this, false)}>
            {t("decline")}
          </button>
          <button onClick={this.setAgreement.bind(this, true)}>
            {t("accept")}
          </button>
        </div>
      </div>
    );
  }
}

export default withTranslation("common")(MarketingAgreement);
