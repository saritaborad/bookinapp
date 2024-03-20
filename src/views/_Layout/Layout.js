import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Redirect, Route, Switch } from "react-router-dom";
import { authService } from "../../services/authService";
import About from "../About/About";
import Book from "../Book/Book";
import Details from "../Details/Details";
import PrivacyPolicy from "../PrivacyPolicy/PrivacyPolicy";
import Search from "../Search/Search";
import Services from "../Services/Services";
import Contact from "./Contact";
import Footer from "./Footer";
import Header from "./Header";
import "./Layout.scss";
import MarketingAgreement from "./MarketingAgreement";
import { checkForArabic } from "../../helpers/arabicLangValidator";

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contactVisible: false,
      selectedTag: null,
    };

    const params = new URLSearchParams(this.props.location.search);
    const admin = params.get("admin");
    if (admin) {
      authService.setAdmin();
    }
  }

  componentDidMount() {
    window.addEventListener("openContact", this.showContact.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener("openContact", this.showContact.bind(this));
  }

  showContact() {
    this.setContactVisible(true);
  }

  setContactVisible(value) {
    this.setState({ contactVisible: value });
  }

  onCityUpdate(tag) {
    this.setState({ selectedTag: tag });
  }

  render() {
    return (
      <div className="container" dir={checkForArabic("rtl", "ltr")}>
        <Header
          {...this.props}
          setContactVisible={this.setContactVisible.bind(this)}
        />
        <div className="main">
          <Switch>
            <Route
              path="/search"
              render={(props) => (
                <Search
                  {...props}
                  onCityUpdate={this.onCityUpdate.bind(this)}
                />
              )}
            />
            <Route
              path="/book/:propertyId"
              render={(props) => (
                <Book {...props} onCityUpdate={this.onCityUpdate.bind(this)} />
              )}
            />
            <Route
              path="/details/:propertyId"
              render={(props) => (
                <Details
                  {...props}
                  onCityUpdate={this.onCityUpdate.bind(this)}
                />
              )}
            />
            <Route
              path="/about"
              render={(props) => (
                <About {...props} onCityUpdate={this.onCityUpdate.bind(this)} />
              )}
            />
            <Route
              path="/services"
              render={(props) => (
                <Services
                  {...props}
                  onCityUpdate={this.onCityUpdate.bind(this)}
                />
              )}
            />
            <Route
              path="/privacy-policy"
              render={(props) => (
                <PrivacyPolicy
                  {...props}
                  onCityUpdate={this.onCityUpdate.bind(this)}
                />
              )}
            />
            <Redirect to="/" />
          </Switch>
        </div>
        <Footer selectedTag={this.state.selectedTag} />
        <MarketingAgreement />
        <Contact
          key={this.state.contactVisible}
          popupVisible={this.state.contactVisible}
          setContactVisible={this.setContactVisible.bind(this)}
          selectedTag={this.state.selectedTag}
        />
      </div>
    );
  }
}

export default withTranslation("common")(Layout);
