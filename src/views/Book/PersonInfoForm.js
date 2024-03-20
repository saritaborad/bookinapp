import moment from "moment";
import React from "react";
import SimpleReactValidator from "simple-react-validator";
import i18n from "../../i18n";
import { detailsService } from "../../services/detailsService";
import PersonInformation from "./PersonInformation";
import PrivacyPolicyAgreements from "./PrivacyPolicyAgreements";
import settings from "../../settings";

class PersonInfoForm extends React.Component {
  listing = null;
  constructor(props) {
    super(props);

    this.state = {
      startDate: this.props.startDate ? moment(this.props.startDate) : null,
      endDate: this.props.endDate ? moment(this.props.endDate) : null,
      guests: this.props.guests ? this.props.guests : 1,
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      formatedNumber: "",
      message: "",
      elementRef: null,
      marketing: false,
      privacyPolicy: false,
      promoCode: "",
      promoCodeError: "",
      responseError: null,
      requestPending: false,
      couponPending: false,
      errors: [],
    };
    this.validator = new SimpleReactValidator();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.promoCode !== this.state.promoCode) {
      this.setState({ promoCodeError: "" });
    }
  }

  formatedNumberChange(formatedNumber) {
    this.setState({ formatedNumber });
  }

  onChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  onSubmit(event) {
    event.preventDefault();
    if (!this.validator.allValid()) {
      this.validator.showMessages();
      this.forceUpdate();
      return;
    }
    this.processSubmit();
  }

  checkCoupon() {
    if (!this.state.promoCode?.trim().length) {
      return;
    }

    this.setState({ couponPending: true });
    const data = this.getReservationObject();
    detailsService
      .getPromoCode(data, i18n.language)
      .then((response) => {
        if (response.success) {
          this.props.onPromoCodeUpdated(response);
          this.setState({
            promoCodeError: "",
          });
        } else {
          this.props.onPromoCodeUpdated(null);
          this.setState({
            promoCodeError: response.message,
          });
        }
        this.setState({
          couponPending: false,
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({ couponPending: false });
      });
  }

  getReservationObject = () => {
    return {
      promoCode: this.state.promoCode?.length
        ? this.state.promoCode.trim()
        : null,
      accountId: this.listing?.accountId,
      listingId: this.props.propertyId,
      plannedArrival: "15:00",
      plannedDeparture: "11:00",
      checkInDateLocalized: this.state.startDate.format("YYYY-MM-DD"),
      checkOutDateLocalized: this.state.endDate.format("YYYY-MM-DD"),
      status: "awaiting_payment",
      guest: {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        email: this.state.email,
        phone: this.state.formatedNumber,
      },
      guestsCount: this.state.guests,
      notes: this.state.message,
      privacyPolicy: this.state.privacyPolicy,
      marketing: this.state.marketing,
    };
  };

  processSubmit = () => {
    this.setState({ requestPending: true });
    const data = this.getReservationObject();
    detailsService
      .setReservation(data, i18n.language)
      .then((response) => {
        if (response.id) {
          if (window.IS_UAE && window.gtag) {
            window.gtag("event", "purchase", {
              transaction_id: response.id,
              coupon: data.promoCode,
              items: [{ item_id: data.listingId }],
            });
          }
          if (window.IS_UAE && window.fbq) {
            window.fbq("trackCustom", "purchase", {
              transaction_id: response.id,
              coupon: data.promoCode,
              items: [{ item_id: data.listingId }],
            });
          }
          if (!window.IS_UAE && window.gtag) {
            window.gtag("event", "conversion", {
              send_to: "AW-825511800/M74VCN-sm-0BEPie0YkD",
              transaction_id: response.id,
            });
          }
          setTimeout(() => {
            this.redirectToPayment(response.id);
          }, 100);
        } else {
          if (response.message.includes("PromoCode is not valid")) {
            this.setState({
              promoCodeError: "Promo code is not valid",
            });
          } else {
            this.setState({
              errors: [response.message],
            });
          }
        }
        this.setState({ requestPending: false });
      })
      .catch((error) => {
        this.setState({
          requestPending: false,
          errors: [error.response.data.message || "An error occured"],
        });
      });
  };

  redirectToPayment(reservationId) {
    window.location.href =
      settings.frankPorterPayUrl + "/payment/pay/?id=" + reservationId;
  }

  updatePrivacyPolicy(privacyState) {
    this.setState({ ...privacyState });
  }

  render() {
    const { t } = this.props;
    return (
      <form className="guest-form" onSubmit={this.onSubmit.bind(this)}>
        <div className="guest-details-container">
          <h2 className="form-header">{t("guestDetails")}</h2>
          <PersonInformation
            firstName={this.state.firstName}
            lastName={this.state.lastName}
            email={this.state.email}
            message={this.state.message}
            formatedNumber={this.state.formatedNumber}
            {...this.props}
            validator={this.validator}
            onChange={this.onChange.bind(this)}
            formatedNumberChange={this.formatedNumberChange.bind(this)}
          />
          <div className="promo-box">
            <div className="promo-box__row">
              <input
                value={this.state.promoCode}
                onChange={this.onChange.bind(this)}
                name="promoCode"
                placeholder={t("promoCode")}
              />
              <button
                className="button"
                type="button"
                onClick={this.checkCoupon.bind(this)}
              >
                {t("checkCoupon")}
                {this.state.couponPending ? (
                  <div className="loader"></div>
                ) : null}
              </button>
            </div>
            {this.state.promoCodeError?.length &&
            !this.state.couponPending &&
            !this.state.requestPending ? (
              <p className="error-message">{this.state.promoCodeError}</p>
            ) : null}
          </div>
        </div>
        <div className="billing-details-container">
          <h2 className="form-header">{t("billingDetails")}</h2>
          <div className="card-details-forms">
            <PrivacyPolicyAgreements
              updatePrivacyPolicy={this.updatePrivacyPolicy.bind(this)}
              validator={this.validator}
              {...this.props}
            />
          </div>
          {this.state.responseError && this.state.responseError.length ? (
            <div className="srv-validation-message">
              {this.state.responseError}
            </div>
          ) : null}
          {this.state.errors.map((error, i) => (
            <p className="error-message" key={i}>
              {error}
            </p>
          ))}
          <button
            id="book-now-btn"
            disabled={this.state.requestPending}
            className="button book-button"
            type="submit"
          >
            {t("bookNow")}
            {this.state.requestPending ? <div className="loader"></div> : null}
          </button>
        </div>
      </form>
    );
  }
}

export default PersonInfoForm;
