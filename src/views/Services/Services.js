import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { withTranslation } from "react-i18next";
import bedIcon from "../../assets/icons/amenities/bed.svg";
import cleaningIcon from "../../assets/icons/amenities/cleaning.svg";
import doormanIcon from "../../assets/icons/amenities/doorman.svg";
import longTermIcon from "../../assets/icons/amenities/long_term.svg";
import shampooIcon from "../../assets/icons/amenities/shampoo.svg";
import wifiIcon from "../../assets/icons/amenities/wifi.svg";
import "./Services.scss";

class Services extends Component {
  componentDidMount() {
    this.props.onCityUpdate(null);
  }

  render() {
    const { t } = this.props;
    return (
      <div className="subpage-container services-container">
        <Helmet>
          <title>Frank Porter Booking Site - Services</title>
        </Helmet>
        <div className="services-image"></div>
        <h1 className="header">{t("servicesDescription1")}</h1>
        <p className="description">{t("servicesDescription2")}</p>
        <p className="description bottom-decor url-box">
          <a href={`https://frankporter.${window.IS_UAE ? "com" : "ru"}`}>
            frankporter.{window.IS_UAE ? "com" : "ru"}
          </a>
        </p>

        <div className="amenities">
          <div className="amenity">
            <img src={wifiIcon} alt="Wifi" />
            <div>{t("wifiDescription")}</div>
          </div>
          <div className="amenity">
            <img src={bedIcon} alt="Bed" />
            <div>{t("bedDescription")}</div>
          </div>
          <div className="amenity">
            <img src={cleaningIcon} alt="Cleaning" />
            <div>{t("cleaningDescription")}</div>
          </div>
          <div className="amenity">
            <img src={shampooIcon} alt="Shampoo" />
            <div>{t("shampooDescription")}</div>
          </div>
          <div className="amenity">
            <img src={longTermIcon} alt="Long Term" />
            <div>{t("longTermDescription")}</div>
          </div>
          <div className="amenity">
            <img src={doormanIcon} alt="Doorman" />
            <div>{t("doormanDescription")}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation("services")(Services);
