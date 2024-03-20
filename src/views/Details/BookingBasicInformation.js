import React, { Component } from "react";
import currencySymbolMap from "../../helpers/currencySymbolMap";
import { toNumberWithCorrectForm } from "../../helpers/numberHelper";
import "./BookingDetails.scss";
import { isPordalProperty } from "../../helpers/propertyFrom";

class BookingBasicInformation extends Component {
  render() {
    if (!this.props.property) {
      return <div></div>;
    }
    return (
      <div className="property-description bottom-space ">
        <div className="property-info">
          <h1 className="property-name">{this.props.property.title}</h1>
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
              {this.props.property.bedrooms === 0
                ? this.props.t("common:studio")
                : toNumberWithCorrectForm(
                    this.props.property.bedrooms,
                    this.props.t("common:bedroom"),
                    this.props.t("common:bedrooms")
                  )}
            </span>
          </div>
        </div>
        <div className="property-pricing">
          <span className="property-price">
            {this.props.reservation
              ? Math.round(
                  isPordalProperty(this.props.property._id)
                    ? this.props.reservation.pricePerNight
                    : this.props.reservation.perNight
                )
              : this.props.property.prices.basePrice}
          </span>
          <span className="property-currency">
            {currencySymbolMap[this.props.property.prices.currency]}
          </span>
          <div className="sum-switch">
            <span className="per-night selected">
              {this.props.t("common:night")}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default BookingBasicInformation;
