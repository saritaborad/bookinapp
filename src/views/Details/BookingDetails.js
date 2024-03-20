import React, { Component } from "react";
import map from "lodash/map";
import pickBy from "lodash/pickBy";
import zipObject from "lodash/zipObject";
import moment from "moment";
import { withTranslation } from "react-i18next";
import { isPordalProperty } from "../../helpers/propertyFrom";
import currencySymbolMap from "../../helpers/currencySymbolMap";
import {
  toNumberWithCorrectForm,
  toSpaceSeparated,
} from "../../helpers/numberHelper";
import { detailsService } from "../../services/detailsService";
import { getBlockedDays } from "../../services/listingService";
import BookingCalendar from "./BookingCalendar";
import "./BookingDetails.scss";
import { showIncorrectPropertyIdAllert } from "../../helpers/alerts";
import settings from "../../settings";
import { calculateNumberOfDays } from "../../helpers/dates";

class BookingDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: this.props.startDate ? moment(this.props.startDate) : null,
      endDate: this.props.endDate ? moment(this.props.endDate) : null,
      guests: this.props.guests ? this.props.guests : 1,
      focusedInput: null,
      blockedDays: [],
      bookedDays: [],
      minNights: this.props.property?.terms.minNights,
      maxNights: this.props.property?.terms.maxNights,
      maxGuests: this.props.property?.accommodates,
      details: this.props.property,
      reservation: null,
      gettingData: true,
      gettingCalendar: false,
      errors: [],
      isPordalproperty: isPordalProperty(this.props.propertyId),
    };
  }

  componentDidMount() {
    this.getCalendar();
    if (!this.props.property) {
      this.getListingDetails();
    }
    this.getReservationQuote();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.promoCode !== this.props.promoCode) {
      this.getReservationQuote();
    }
  }

  async getListingDetailsIfPossible() {
    if (this.state.startDate && this.state.endDate) {
      await this.getReservationQuote();
      if (this.props.updateLocation) {
        this.props.updateLocation(
          this.state.startDate,
          this.state.endDate,
          this.state.guests
        );
      }
    } else {
      this.setState({ reservation: null });
    }
  }

  async getReservationQuote() {
    if (
      !this.state.startDate ||
      !this.state.endDate ||
      this.state.guests <= 0
    ) {
      this.setState({ gettingData: false });
      return;
    }
    this.setState({ gettingData: true, errors: [] });
    const reservationQuote = await detailsService.getReservationQuote(
      this.props.propertyId,
      this.state.startDate
        ? this.state.startDate.format("YYYY-MM-DD")
        : undefined,
      this.state.endDate ? this.state.endDate.format("YYYY-MM-DD") : undefined,
      this.state.guests
    );
    if (this.props.reservationChanged) {
      this.props.reservationChanged(null, reservationQuote);
    }

    const discountedPrice =
      reservationQuote.fareAccommodation +
      this.calculateDiscount() +
      reservationQuote.fareCleaning;

    const vat = this.state.isPordalproperty
      ? null
      : reservationQuote.settingsSnapshot.taxes.find(
          ({ type }) => type === "VAT"
        );
    const tourismTax = this.state.isPordalproperty
      ? null
      : reservationQuote.invoiceItems.find(
          ({ title }) => title === "TOURISM_TAX"
        );
    const totalTaxes = this.state.isPordalproperty
      ? null
      : tourismTax.amount + discountedPrice * (vat.amount / 100);

    this.setState({
      reservation: this.state.isPordalproperty
        ? reservationQuote
        : {
            ...reservationQuote,
            paymentsDue: totalTaxes + discountedPrice,
            totalTaxes,
          },
      gettingData: false,
    });
  }

  async getListingDetails(tryCount = 1, clean = false) {
    if (tryCount > 2) {
      this.setState({ gettingData: false });
      await showIncorrectPropertyIdAllert(
        "common:errorOccuredWhileGettingData",
        this.props.t,
        this.props.history
      );
      return;
    }

    try {
      const listing = await detailsService.getListingDetails(
        this.props.propertyId,
        this.state.startDate && !clean
          ? this.state.startDate.format("YYYY-MM-DD")
          : undefined,
        this.state.endDate && !clean
          ? this.state.endDate.format("YYYY-MM-DD")
          : undefined,
        this.state.guests
      );

      if (
        settings.citiesTags.some(
          ({ tag, visible }) => listing.tags.includes(tag) && !visible
        )
      ) {
        window.location.href =
          window.location.origin + "/" + settings.menuItems[0].url;
      }
      if (this.props.reservationChanged) {
        this.props.reservationChanged(listing);
      }
      this.setState({
        details: listing,
        minNights: listing.terms.minNights,
        maxNights: listing.terms.maxNights,
        maxGuests: listing.accommodates,
        gettingData: false,
        errors: clean ? [this.props.t("propertyNotAvailable")] : [],
      });
    } catch (error) {
      this.setState({
        gettingData: false,
      });
      this.getListingDetails(tryCount + 1, true);
    }
  }

  getCalendar() {
    const startDate = this.state.startDate ? this.state.startDate : moment();
    const endDate = this.state.startDate ? this.state.startDate : moment();
    this.getPropertyCalendar(startDate, endDate.clone().add(6, "months"), true);
  }

  getBlockedDaysMap(bookedDays) {
    return pickBy(
      zipObject(
        map(bookedDays, ({ date }) => date),
        getBlockedDays(bookedDays)
      ),
      (date) => !!date
    );
  }

  async getPropertyCalendar(startDate, endDate, reset) {
    this.setState({ gettingCalendar: true });
    try {
      const result = await detailsService.getCalendarDetails(
        this.props.propertyId,
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD")
      );

      const blockedDays = this.getBlockedDaysMap(result);
      if (reset) {
        this.setState({
          blockedDays: blockedDays,
          bookedDays: result,
        });
      } else {
        this.setState({
          blockedDays: { ...this.state.blockedDays, ...blockedDays },
          bookedDays: this.state.bookedDays.concat(result),
        });
      }
      this.setState({ gettingCalendar: false });
    } catch (error) {
      this.setState({ gettingCalendar: false });
      await showIncorrectPropertyIdAllert(
        "common:errorPropertyCalendarData",
        this.props.t,
        this.props.history
      );
    }
  }

  onDatesChange(startDate, endDate) {
    this.setState(
      {
        startDate,
        endDate,
      },
      () => {
        if (startDate && endDate) {
          this.getListingDetailsIfPossible();
        } else if (!startDate && !endDate) {
          this.getCalendar();
        }
      }
    );
  }

  onChangeHandler(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  onMinusClick() {
    const guests = parseInt(this.state.guests);
    this.setGuestQuantity(
      guests > 0 && !isNaN(guests) ? guests - 1 : !isNaN(guests) ? guests : 0
    );
  }

  onPlusClick() {
    const guests = parseInt(this.state.guests);
    this.setGuestQuantity(!isNaN(guests) ? guests + 1 : 0);
  }

  onGuestChange(event) {
    const parsedNumber = parseInt(event.target.value);
    this.setGuestQuantity(parsedNumber);
  }

  setGuestQuantity(parsedNumber) {
    if (parsedNumber >= 0 && parsedNumber <= this.state.details.accommodates) {
      this.setState(
        {
          guests: parsedNumber,
        },
        () => {
          this.getListingDetailsIfPossible();
        }
      );
    }
  }

  isBookingDisabled = () => {
    return !(
      this.state.details &&
      this.state.guests > 0 &&
      this.state.guests <= this.state.details.accommodates &&
      this.state.startDate &&
      this.state.endDate &&
      this.state.startDate.isBefore(this.state.endDate) &&
      this.state.errors.length === 0
    );
  };

  onBookNowClick() {
    if (window.IS_UAE && window.gtag) {
      window.gtag("event", "begin_checkout", {
        ...(this.state.reservation
          ? {
              value: this.state.isPordalproperty
                ? this.state.reservation.totalPrice
                : this.state.reservation.paymentsDue,
              currency: this.state.reservation.currency,
            }
          : {}),
      });
    }
    if (window.IS_UAE && window.fbq) {
      window.fbq("trackCustom", "begin_checkout", {
        ...(this.state.reservation
          ? {
              value: this.state.isPordalproperty
                ? this.state.reservation.totalPrice
                : this.state.reservation.paymentsDue,
              currency: this.state.reservation.currency,
            }
          : {}),
      });
    }
    this.props.history.push(
      `/book/${this.props.propertyId}?from=${this.state.startDate.format(
        "YYYY-MM-DD"
      )}&to=${this.state.endDate.format("YYYY-MM-DD")}&guests=${
        this.state.guests
      }`
    );
  }

  calculateDiscount() {
    if (!this.state.reservation?.fareAccommodation || !this.props.promoCode) {
      return 0;
    }

    if (this.props.promoCode.type === "amount") {
      return this.props.promoCode.amount * -1;
    }
    return (
      ((this.state.reservation?.fareAccommodation *
        this.props.promoCode.amount) /
        100) *
      -1
    );
  }

  render() {
    return (
      <div className="booking-details">
        {!this.props.readOnly ? (
          <div>
            <BookingCalendar
              blockedDays={this.state.blockedDays}
              bookedDays={this.state.bookedDays}
              propertyId={this.props.propertyId}
              getPropertyCalendar={this.getPropertyCalendar.bind(this)}
              minNights={this.state.minNights}
              maxNights={this.state.maxNights}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              onDatesChange={this.onDatesChange.bind(this)}
              disabled={this.state.gettingCalendar || this.state.gettingData}
            />
            <div className="plus-minus-container">
              <div className="plus-minus-label">
                {this.props.t("common:guests")}:
              </div>
              <div className="plus-minus-value">
                <div className="minus" onClick={this.onMinusClick.bind(this)}>
                  -
                </div>
                <input
                  type="text"
                  className="plus-minus-input"
                  onChange={this.onGuestChange.bind(this)}
                  value={this.state.guests}
                  name="guests"
                />
                <div className="plus" onClick={this.onPlusClick.bind(this)}>
                  +
                </div>
              </div>
            </div>
          </div>
        ) : this.state.reservation &&
          this.state.startDate &&
          !this.state.gettingData &&
          !this.state.gettingCalendar ? (
          <div className="read-only-data">
            <div className="order-details">
              {toNumberWithCorrectForm(
                this.state.guests,
                this.props.t("common:guest"),
                this.props.t("common:guests")
              )}
            </div>
            <span className="order-details">
              {toNumberWithCorrectForm(
                calculateNumberOfDays(this.state.startDate, this.state.endDate),
                this.props.t("night"),
                this.props.t("nights")
              )}
            </span>

            <p className="check-in-out-label">
              {this.props.t("checkIn")}:{" "}
              {this.state.startDate.format("YYYY-MM-DD")}
            </p>
            <p className="check-in-out-label bottom-decor">
              {this.props.t("checkOut2")}:{" "}
              {this.state.endDate.format("YYYY-MM-DD")}
            </p>
          </div>
        ) : null}
        {this.state.gettingData || this.state.gettingCalendar ? (
          <div className="loader loader-abs"></div>
        ) : null}
        {this.state.reservation &&
        this.state.startDate &&
        !this.state.gettingData &&
        !this.state.gettingCalendar ? (
          <div>
            <div className="details-summary-row">
              <div className="expense-name">
                {toNumberWithCorrectForm(
                  calculateNumberOfDays(
                    this.state.startDate,
                    this.state.endDate
                  ),
                  this.props.t("night"),
                  this.props.t("nights")
                )}
              </div>
              <div className="expense-value">
                {toSpaceSeparated(
                  isPordalProperty(this.props.propertyId)
                    ? this.state.reservation.accommodationPriceNetto
                    : this.state.reservation.fareAccommodation
                )}{" "}
                {this.state.details &&
                  currencySymbolMap[this.state.details.prices.currency]}
              </div>
            </div>
            {isPordalProperty(this.props.propertyId) &&
              this.state.reservation.discountAmount > 0 && (
                <div className="details-summary-row">
                  <div className="expense-name">
                    {this.props.t("discountAmount")}
                  </div>
                  <div className="expense-value">
                    {`-${toSpaceSeparated(
                      Math.abs(this.state.reservation.discountAmount)
                    )}`}{" "}
                    {this.state.details &&
                      currencySymbolMap[this.state.details.prices.currency]}
                  </div>
                </div>
              )}
            {this.props.promoCode ? (
              <div className="details-summary-row">
                <div className="expense-name">
                  {this.props.t("book:promoCode")}
                </div>
                <div className="expense-value">
                  {toSpaceSeparated(this.calculateDiscount())}{" "}
                  {this.state.details &&
                    currencySymbolMap[this.state.details.prices.currency]}
                </div>
              </div>
            ) : null}
            <div className="details-summary-row">
              <div className="expense-name">{this.props.t("cleaningFee")}</div>
              <div className="expense-value">
                {toSpaceSeparated(
                  isPordalProperty(this.props.propertyId)
                    ? this.state.reservation.charges.find(
                        (charge) => charge.name === "cleaningFeeNetto"
                      ).value
                    : this.state.reservation.fareCleaning
                )}{" "}
                {this.state.details &&
                  currencySymbolMap[this.state.details.prices.currency]}
              </div>
            </div>
            {isPordalProperty(this.props.propertyId) && (
              <div className="details-summary-row">
                <div className="expense-name">{this.props.t("tourismTax")}</div>
                <div className="expense-value">
                  {this.props.reservation
                    ? this.props.reservation.totalPrice
                    : null}
                  {toSpaceSeparated(this.state.reservation.tourismTaxFee)}{" "}
                  {this.state.details &&
                    currencySymbolMap[this.state.details.prices.currency]}
                </div>
              </div>
            )}

            {this.state.reservation.totalTaxes > 0 ? (
              <div className="details-summary-row">
                <div className="expense-name">
                  {this.props.t(
                    isPordalProperty(this.props.propertyId) ? "vat" : "taxes"
                  )}
                </div>
                <div className="expense-value">
                  {toSpaceSeparated(this.state.reservation.totalTaxes)}{" "}
                  {this.state.details &&
                    currencySymbolMap[this.state.details.prices.currency]}
                </div>
              </div>
            ) : null}
            <div className="details-summary-row total">
              <div className="expense-name">{this.props.t("total")}</div>
              <div className="expense-value">
                {toSpaceSeparated(
                  isPordalProperty(this.props.propertyId)
                    ? this.state.reservation.totalPrice
                    : this.state.reservation.paymentsDue
                )}{" "}
                {this.state.details &&
                  currencySymbolMap[this.state.details.prices.currency]}
              </div>
            </div>
            {!this.props.readOnly ? (
              <div>
                <button
                  className="button book-button"
                  disabled={this.isBookingDisabled()}
                  onClick={this.onBookNowClick.bind(this)}
                >
                  {this.props.t("bookNow")}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="error-messages">
          {this.state.errors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      </div>
    );
  }
}

export default withTranslation("details")(BookingDetails);
