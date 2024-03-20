import React, { Component } from "react";
import moment from "moment";
import { withTranslation } from "react-i18next";
import "react-intl-tel-input/dist/main.css";
import { detailsService } from "../../services/detailsService";
import BookingDetails from "../Details/BookingDetails";
import Gallery from "../Details/Gallery";
import "./Book.scss";
import PersonInfoForm from "./PersonInfoForm";
import settings from "../../settings";
import { showIncorrectPropertyIdAllert } from "../../helpers/alerts";

class Book extends Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(this.props.location.search);
    const from = params.get("from");
    const to = params.get("to");
    const guests = params.get("guests");

    this.state = {
      propertyId: this.props.match.params.propertyId,
      startDate: from ? moment(from) : null,
      endDate: to ? moment(to) : null,
      guests: guests ? parseInt(guests) : 1,
      details: null,
      gettingData: true,
      intents: null,
      promoCode: null,
    };

    this.getListingDetails();
  }

  getListingDetails() {
    detailsService
      .getListingDetails(this.state.propertyId)
      .then((details) => {
        this.setState({
          details: details,
          gettingData: false,
          isDubai: details.tags.some((x) => x === 'DXB'),
          isAbuDhabi: details.tags.some((x) => x === 'AUH'),
        });
        const tag = settings.citiesTags.filter(({visible}) => visible).find(({ tag }) =>
          details.tags.find((x) => tag === x)
        );

        this.props.onCityUpdate(tag);
      })
      .catch(() => {
        this.setState({ gettingData: false });
        showIncorrectPropertyIdAllert("common:errorOccuredWhileGettingData", this.props.t, this.props.history);
      });
  }

  onSubmit(state) {}

  onPromoCodeUpdated = (promoCode) => {
    this.setState({ promoCode });
  };

  render() {
    if (this.state.gettingData || !this.state.details) {
      return <div className="loader"></div>;
    }
    const { t } = this.props;
    return (
      <div className="book-container">
        <div className="user-data">
          <PersonInfoForm
            {...this.props}
            onSubmit={this.onSubmit.bind(this)}
            intents={this.state.intents}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            guests={this.state.guests}
            propertyId={this.state.propertyId}
            onPromoCodeUpdated={this.onPromoCodeUpdated}
          />
        </div>
        <div className="booking-summary">
          <Gallery
            singlePicture
            coverPicture
            pictures={this.state.details.pictures}
          />
          <h2 className="property-name">{this.state.details.title}</h2>
          <p className="property-address">
            {this.state.details.address.city === "ABU"
              ? t("abuDhabi")
              : this.state.details.address.city}
            ,{" "}
            {this.state.details.address.country === "Abu Dhabi UAE"
              ? t("unitedArabEmirates")
              : this.state.details.address.country}
          </p>
          <BookingDetails
            {...this.props}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            guests={this.state.guests}
            propertyId={this.state.propertyId}
            promoCode={this.state.promoCode}
            readOnly
          />
        </div>
      </div>
    );
  }
}

export default withTranslation("book")(Book);
