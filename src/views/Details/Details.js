import moment from "moment";
import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { withTranslation } from "react-i18next";
import currencySymbolMap from "../../helpers/currencySymbolMap";
import { toNumberWithCorrectForm } from "../../helpers/numberHelper";
import settings from "../../settings";
import SearchMap from "../Search/SearchMap";
import Amenities from "./Amenities";
import BookingBasicInformation from "./BookingBasicInformation";
import BookingDetails from "./BookingDetails";
import "./Details.scss";
import Gallery from "./Gallery";
import { checkForArabic } from "../../helpers/arabicLangValidator";

class Details extends Component {
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
      focusedInput: null,
      guests: guests ? parseInt(guests) : 1,
      details: null,
      reservation: null,
      gettingData: true,
      showAllAmenities: false,
      readMoreText: false,
    };
  }

  reservationChanged(details, reservation) {
    this.setState({
      ...(details ? { details: details } : {}),
      ...(reservation ? { reservation: reservation } : {}),
      gettingData: false,
    });

    if (details) {
      const tag = settings.citiesTags
        .filter(({ visible }) => visible)
        .find(({ tag }) => details.tags.find((x) => tag === x));

      this.props.onCityUpdate(tag);
    }
  }

  updateLocation(startDate, endDate, guests) {
    this.props.history.push(
      `/details/${this.state.propertyId}?from=${startDate.format(
        "YYYY-MM-DD"
      )}&to=${endDate.format("YYYY-MM-DD")}&guests=${guests}`
    );
  }

  onShowAllAmenitiesClick() {
    this.setState({ showAllAmenities: !this.state.showAllAmenities });
  }

  onReadMoreTextClick() {
    this.setState({ readMoreText: !this.state.readMoreText });
  }

  render() {
    return (
      <div className={`booking-details-container ${checkForArabic("arabic-booking-details-container")}`}>
        <div className="booking-basic-info">
          <div className="gallery-container">
            {this.state.details ? (
              <Gallery
                showArrows
                showThumbnails
                withLightbox
                transparentArrows
                pictures={this.state.details.pictures}
              />
            ) : null}
          </div>
          {this.state.details ? (
            <Helmet>
              <title>
                Frank Porter Booking Site - {this.state.details.title}
              </title>
              <meta
                name="description"
                content={this.state.details.publicDescription.summary}
              />
            </Helmet>
          ) : null}
          <div className="booking-reservation">
            <div className="booking-reservation-center">
              <BookingBasicInformation
                {...this.props}
                property={this.state.details}
                reservation={this.state.reservation}
                key={this.state.gettingData}
                startDate={this.state.startDate}
                endDate={this.state.endDate}
              />
              <BookingDetails
                {...this.props}
                reservationChanged={this.reservationChanged.bind(this)}
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                guests={this.state.guests}
                propertyId={this.state.propertyId}
                updateLocation={this.updateLocation.bind(this)}
              />
            </div>
          </div>
        </div>
        {this.state.details ? (
          <div className="property-details">
            <div className="property-general-info-row bottom-decor">
              <div className="property-general-info">
                <p className="property-name">{this.state.details.title}</p>
                <div className="property-basic-info-icons">
                  <div className="icon-container">
                    <i className="icon-guest icon" />
                    <span>
                      {toNumberWithCorrectForm(
                        this.state.details.accommodates,
                        this.props.t("common:guest"),
                        this.props.t("common:guests")
                      )}
                    </span>
                  </div>
                  <div className="icon-container">
                    <i className="icon-room icon" />
                    <span>
                      {this.state.details.bedrooms === 0
                        ? this.props.t("common:studio")
                        : toNumberWithCorrectForm(
                            this.state.details.bedrooms,
                            this.props.t("common:room"),
                            this.props.t("common:rooms")
                          )}
                    </span>
                  </div>
                  <div className="icon-container">
                    <i className="icon-bed icon" />
                    <span>
                      {toNumberWithCorrectForm(
                        this.state.details.beds,
                        this.props.t("common:bed"),
                        this.props.t("common:beds")
                      )}
                    </span>
                  </div>
                  <div className="icon-container">
                    <i className="icon-bathroom icon" />
                    <span>
                      {toNumberWithCorrectForm(
                        this.state.details.bathrooms,
                        this.props.t("common:bathroom"),
                        this.props.t("common:bathrooms")
                      )}
                    </span>
                  </div>
                </div>
                <p
                  className="description bottom-decor"
                  dangerouslySetInnerHTML={{
                    __html: this.state.details.publicDescription.summary,
                  }}
                />
                <div className="flex-col bottom-decor">
                  <div className="col-2">
                    <p className="details-header">
                      {this.props.t("checkInOut")}
                    </p>
                    <span className="values">
                      {this.props.t("checkIn")}:{" "}
                      {this.state.details.defaultCheckInTime}
                    </span>
                    <br />
                    <span className="values">
                      {this.props.t("checkOut2")}:{" "}
                      {this.state.details.defaultCheckOutTime}
                    </span>
                  </div>
                  <div className="col-2">
                    <p className="details-header">{this.props.t("prices")}</p>
                    <span className="values">
                      {this.props.t("weeklyDiscount")}:{" "}
                      {Math.round(
                        (1 - this.state.details.prices.weeklyPriceFactor) * 100
                      )}
                      %
                    </span>
                    <br />
                    <span className="values">
                      {this.props.t("monthlyDiscount")}:{" "}
                      {Math.round(
                        (1 - this.state.details.prices.monthlyPriceFactor) * 100
                      )}
                      %
                    </span>
                    <br />
                    {this.state.details.prices.securityDepositFee && (
                      <span className="values">
                        {this.props.t("securityDeposit")}:{" "}
                        {this.state.details.prices.securityDepositFee}{" "}
                        {currencySymbolMap[this.state.reservation?.currency]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-col wrap-reverse">
                  <div className="col-2">
                    <p className="details-header">
                      {this.props.t("importantInformation")}
                    </p>
                    <p className="details-subheader">{this.props.t("space")}</p>
                    <span
                      className="values description"
                      dangerouslySetInnerHTML={{
                        __html: this.state.readMoreText
                          ? this.state.details.publicDescription.space
                          : this.state.details.publicDescription.space &&
                            this.state.details.publicDescription.space.slice(
                              0,
                              250
                            ) + "...",
                      }}
                    />
                    {this.state.readMoreText ? (
                      <div>
                        <p className="details-subheader">
                          {this.props.t("guestAccess")}
                        </p>
                        <span
                          className="values description"
                          dangerouslySetInnerHTML={{
                            __html: this.state.details.publicDescription.access,
                          }}
                        />
                        <p className="details-subheader">
                          {this.state.details.publicDescription
                            .interactionWithGuests &&
                            this.props.t("interaction")}
                        </p>
                        <span
                          className="values description"
                          dangerouslySetInnerHTML={{
                            __html:
                              this.state.details.publicDescription
                                .interactionWithGuests,
                          }}
                        />
                        <p className="details-subheader">
                          {this.props.t("otherThing")}
                        </p>
                        <span
                          className="values description"
                          dangerouslySetInnerHTML={{
                            __html: this.state.details.publicDescription.notes,
                          }}
                        />
                        <p className="details-subheader">
                          {this.props.t("gettingAround")}
                        </p>
                        <span
                          className="values description"
                          dangerouslySetInnerHTML={{
                            __html:
                              this.state.details.publicDescription.transit,
                          }}
                        />
                      </div>
                    ) : null}
                    <button
                      className="button show-more-button margin-top-20"
                      onClick={this.onReadMoreTextClick.bind(this)}
                    >
                      {this.props.t(
                        this.state.readMoreText ? "hide" : "readMore"
                      )}
                    </button>
                  </div>
                  <div className="col-2">
                    <p className="details-header">
                      {this.props.t("stayingRules")}
                    </p>
                    <span className="values">
                      <p
                        className="description"
                        dangerouslySetInnerHTML={{
                          __html: this.state.details.publicDescription
                            .houseRules
                            ? this.state.details.publicDescription.houseRules.replace(
                                /• /g,
                                ""
                              )
                            : null,
                        }}
                      />
                    </span>
                    {this.state.details.prices.securityDepositFee && (
                      <>
                        <p className="details-subheader">
                          {this.props.t("securityDeposit")}
                        </p>
                        <span className="values description arabic-description">
                          {this.props.t("securityDepositInfo")}
                        </span>
                      </>
                    )}
                    <p className="details-subheader">
                      {this.props.t("cancellationPolicy")}
                    </p>
                    <span className="values description arabic-description">
                      {this.props.t("firmCancellation")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="property-location">
                <SearchMap
                  properties={[this.state.details]}
                  mapProperties={[this.state.details]}
                  hoveredProperty={this.state.details}
                  zoom={14}
                />
              </div>
            </div>
            <div className="amenities-row">
              <p className="details-header">{this.props.t("amenities")}</p>
              <Amenities
                amenities={this.state.details.amenities}
                showAllAmenities={this.state.showAllAmenities}
              />
              <button
                className="button show-more-button"
                onClick={this.onShowAllAmenitiesClick.bind(this)}
              >
                {this.props.t(
                  this.state.showAllAmenities ? "hide" : "showMore"
                )}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

export default withTranslation("details")(Details);
