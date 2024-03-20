import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import logo from "../../assets/FP_Logo_White.svg";
import { generateSearchLink } from "../../helpers/urls";
import { authService } from "../../services/authService";
import TopSubmenu from "../_Layout/TopSubmenu";
import "./Home.scss";
import { checkForArabic } from "../../helpers/arabicLangValidator";

class Home extends Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(this.props.location.search);
    const admin = params.get("admin");
    if (admin) {
      authService.setAdmin();
    }
  }

  readMoreClick() {
    window.open(`https://www.frankporter.${window.IS_UAE ? "com" : "ru"}`);
  }

  render() {
    return (
      <div className={`home-container ${checkForArabic("arabic-home-container")}`}>
        <header className="header">
          <div className="fp-logo-col">
            <img className="fp-logo" src={logo} alt="Frank Porter" />
          </div>
          <TopSubmenu />
        </header>
        <div className="welcome-box">
          <h1>{this.props.t("welcomeHeader")}</h1>
          <div className="buttons">
            {window.IS_UAE ? (
              <>
                <a
                  className="button city-button"
                  href={generateSearchLink("dubai", null, null)}
                >
                  <i className="ico ico-dubai" />
                  <span>{this.props.t("common:dubai")}</span>
                </a>
                <a
                  className="button city-button"
                  href={generateSearchLink("abudhabi", null, null)}
                >
                  <i className="ico ico-abudhabi" />
                  <span>{this.props.t("common:abudhabi")}</span>
                </a>
              </>
            ) : null}
            {!window.IS_UAE ? (
              <a
                className="button city-button"
                href={generateSearchLink("stpetersburg", null, null)}
              >
                <i className="ico ico-st-petersburg" />
                <span>{this.props.t("stPetersburg")}</span>
              </a>
            ) : null}
          </div>
          <p className="welcome-desc">{this.props.t("welcomeText")}</p>
          <p className="bottom-desc">{this.props.t("bottomText")}</p>
          <button
            className="button read-more-button"
            onClick={this.readMoreClick.bind(this)}
          >
            frankporter.{window.IS_UAE ? "com" : "ru"}
          </button>
        </div>
      </div>
    );
  }
}

export default withTranslation("home")(Home);
