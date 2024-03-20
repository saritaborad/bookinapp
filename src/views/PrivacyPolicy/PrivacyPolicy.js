import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { withTranslation } from "react-i18next";
import { storageService } from "../../services/storageService";
import "./PrivacyPolicy.scss";

class PrivacyPolicy extends Component {
  componentDidMount() {
    this.props.onCityUpdate(null);
  }

  clearAgreements() {
    storageService.clearUserData();
  }

  render() {
    const { t } = this.props;
    return (
      <div className="subpage-container privacy-policy-container">
        <Helmet>
          <title>Frank Porter Booking Site - Privacy Policy</title>
        </Helmet>
        <div dangerouslySetInnerHTML={{ __html: t("text") }}></div>
        <div className="clear-agreements">
          <span onClick={this.clearAgreements.bind(this)}>
            {t("clearAgreements")}
          </span>
        </div>
      </div>
    );
  }
}

export default withTranslation("privacyPolicy")(PrivacyPolicy);
