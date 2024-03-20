import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import currencySymbolMap from "../../helpers/currencySymbolMap";
import { toNumberWithCorrectForm } from "../../helpers/numberHelper";
import BookingDetails from "../Details/BookingDetails";
import Gallery from "../Details/Gallery";
import "./Search.scss";

class PropertyItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pricePerNight: true,
      expanded: false,
      overflowVisible: false,
      bookingBlockVisible: false,
      showArrows: props.showArrows === undefined ? true : props.showArrows,
      showDots: props.showDots === undefined ? true : props.showDots,
    };
  }

  onSumSwitch(value) {
    this.setState({ pricePerNight: value });
  }

  calculatePrice() {
        return (this.state.pricePerNight) ? this.props.property.prices.basePrice : this.props.property.reservation.totalPrice;
  }

  generateDetailsLink = () => {
    let url = "";
    if (this.props.checkIn && this.props.checkOut) {
      let checkIn = this.props.checkIn.format('YYYY-MM-DD');
      let checkOut = this.props.checkOut.format('YYYY-MM-DD')
      url = `?from=${checkIn}&to=${checkOut}&guests=${this.props.guests}`;
    }

    return `/details/${this.props.property._id}${url}`;
  };

  toggleExpander() {
    if (!this.state.expanded) {
      setTimeout(() => {
        this.setState({
          overflowVisible: true,
        });
      }, 200);
    }
    if (this.state.expanded) {
      setTimeout(() => {
        this.setState({
          bookingBlockVisible: false,
        });
      }, 200);
    }
    this.setState({
      expanded: !this.state.expanded,
      overflowVisible: this.state.expanded ? false : this.state.overflowVisible,
      bookingBlockVisible: !this.state.expanded
        ? true
        : this.state.bookingBlockVisible,
    });
  }

  render() {
    return (
      <div
        className={
          "property-item" + (this.state.expanded ? " expanded-item" : "")
        }
        onMouseEnter={this.props.onPropertyHover.bind(
          this,
          this.props.property
        )}
        onMouseLeave={this.props.onPropertyHover.bind(null)}
        onClick={this.props.onClick}
      >
        <Gallery
          imageLink={this.generateDetailsLink()}
          showArrows={this.state.showArrows}
          showDots={this.state.showDots}
          coverPicture
          pictures={this.props.property.pictures?.slice(0, 5)}
        />

        <div className="property-description">
          <div className="property-info">
            <p className="property-name">{this.props.property.title}</p>
            <div className="property-details">
              <span>
                {toNumberWithCorrectForm(
                  this.props.property.accommodates,
                  this.props.t("common:guest"),
                  this.props.t("common:guests")
                )}
              </span>{" "}
              |{" "}
              <span>
                {this.props.property.bedrooms > 0
                  ? toNumberWithCorrectForm(
                      this.props.property.bedrooms,
                      this.props.t("common:bedroom"),
                      this.props.t("common:bedrooms")
                    )
                  : this.props.t("common:studio")}
              </span>
            </div>
          </div>
          <div className="property-pricing">
            <span className="property-price">{this.calculatePrice()}</span>
            <span className="property-currency">
              {currencySymbolMap[this.props.property.prices?.currency]}
            </span>
            <div className="sum-switch">
              {this.props.property.reservation?.totalPrice ? (
                <span
                  className={
                    "sum" + (!this.state.pricePerNight ? " selected" : "")
                  }
                  onClick={this.onSumSwitch.bind(this, false)}
                >
                  {this.props.t("common:sum")}
                </span>
              ) : null}
              <span
                className={
                  "per-night" + (this.state.pricePerNight ? " selected" : "")
                }
                onClick={this.onSumSwitch.bind(this, true)}
              >
                {this.props.t("common:night")}
              </span>
            </div>
          </div>
        </div>
        {!this.props.simpleView ? (
          <div className="property-additional-info">
            <div className="expander" onClick={this.toggleExpander.bind(this)}>
              <span className="expand-text">
                {this.props.t(this.state.expanded ? "less" : "more")}
              </span>
              <div
                className={
                  "circle-expander" + (this.state.expanded ? " expanded" : "")
                }
              ></div>
            </div>
            <a
              className="button details-button"
              href={this.generateDetailsLink()}
            >
              {this.props.t("details")}
            </a>
          </div>
        ) : null}
        {!this.props.simpleView ? (
          <div
            className={
              "inline-booking" +
              (this.state.expanded ? " expanded" : "") +
              (this.state.overflowVisible ? " o-visible" : "")
            }
          >
            {this.state.bookingBlockVisible ? (
              <BookingDetails
                {...this.props}
                startDate={this.props.checkIn}
                endDate={this.props.checkOut}
                guests={this.props.guests}
                propertyId={this.props.property._id}
                property={this.props.property}
              />
            ) : (
              ""
            )}
          </div>
        ) : null}
      </div>
    );
  }
}

export default withTranslation("search")(PropertyItem);
