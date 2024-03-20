import React from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import logo from "../../assets/FP_Logo_Black.svg";
import i18n from "../../i18n";
import settings from "../../settings";
import TopSubmenu from "./TopSubmenu";

class Header extends React.Component {
  constructor(props) {
    super(props);

    this.state = { menuVisible: false };
  }

  onHamburgerClick() {
    this.setState({ menuVisible: !this.state.menuVisible });
  }

  onMenuClick(menu, event) {
    this.setState({ menuVisible: false });
    if (menu.url === "contact") {
      this.props.setContactVisible(true);
    }
    if (menu.url?.startsWith("search")) {
      window.location.reload();
    }
    if (menu.onClickFunction) {
      menu.onClickFunction();
      event.preventDefault();
    }
  }

  isCurrentPath(url) {
    return url.startsWith(window.location.pathname);
  }

  render() {
    return (
      <div className="topbar">
        <div className="fp-logo-col">
          <a href="/">
            <img className="fp-logo" src={logo} alt="Frank Porter" />
          </a>
        </div>
        <div
          className={"hamburger" + (this.state.menuVisible ? " opened" : "")}
          onClick={this.onHamburgerClick.bind(this)}
        >
          <div></div>
        </div>
        <div className="fp-menu-col">
          <TopSubmenu {...this.props} reversed={true} mainColor={true} />
          <ul
            className={"fp-menu" + (this.state.menuVisible ? " visible" : "")}
          >
            {settings.menuItems
              .filter(
                (menu) =>
                  menu.visibleTopMenu &&
                  !menu.hiddenInLanguages.includes(i18n.language)
              )
              .map((menu) => (
                <li
                  onClick={this.onMenuClick.bind(this, menu)}
                  key={menu.translationKey}
                >
                  {menu.onClickFunction ? (
                    this.props.t(menu.translationKey)
                  ) : (
                    <Link
                      to={`/${menu.url}`}
                      className={
                        this.isCurrentPath(`/${menu.url}`) ? "highlighted" : ""
                      }
                    >
                      {this.props.t(menu.translationKey)}
                    </Link>
                  )}
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
  }
}

export default withTranslation("common")(Header);
