import React from "react";
import { withTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import "./TopSubmenu.scss";
import { checkForArabic } from "../../helpers/arabicLangValidator";

class TopSubmenu extends React.Component {
  render() {
    return (
      <div
        className={
          "top-submenu" +
          (this.props.reversed ? " reversed" : "") +
          (this.props.mainColor ? " main-color" : "") + (checkForArabic(" arabic-top-submenu"))
        }
      >
        <LanguageSelector />

        <div>
          {/* <a className="ico-link" rel="noopener noreferrer" target="_blank" href={this.props.t("twitterUrl")}>
            <i className="ico ico-twitter" />
          </a> */}
          <a
            className="ico-link"
            rel="noopener noreferrer"
            target="_blank"
            href={`https://www.instagram.com/${
              window.IS_UAE ? "mrfrankporter/" : "mrfrankporter.ru/"
            }`}
          >
            <i className="ico ico-instagram" />
          </a>
          {/* <a className="ico-link" rel="noopener noreferrer" target="_blank" href={this.props.t("facebookUrl")}>
            <i className="ico ico-facebook" />
          </a> */}
        </div>
        {/* <div className="spacer"></div> */}
      </div>
    );
  }
}

export default withTranslation("common")(TopSubmenu);
