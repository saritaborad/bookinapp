import React from "react";
import { Link } from "react-router-dom";
import ruCondition from "../../assets/conditions.pdf";
import upperFirst from 'lodash/upperFirst';

class PrivacyPolicyAgreements extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      marketing: null,
      privacyPolicy: null,
      ruCondition: null,
      termsAndCondition: null,
      termsAndConditionVisible: false,
    };
  }

  onChange(event) {
    this.setState(
      {
        [event.target.name]: event.target.checked ? true : null,
      },
      () => {
        this.props.updatePrivacyPolicy({
          marketing: this.state.marketing === true,
          privacyPolicy: this.state.privacyPolicy === true,
          ruCondition: this.state.ruCondition === true,
          termsAndCondition: this.state.termsAndCondition === true,
        });
      }
    );
  }

  onTermsAndConditionClick(e) {
    e.preventDefault();
    this.setState({ termsAndConditionVisible: true });
  }

  render() {
    const { t } = this.props;
    return (
      <>
        {this.state.termsAndConditionVisible ? (
          <>
            <div className="modal-overlay"></div>
            <div className="popup terms-condition-popup">
              <span
                className="close-modal"
                onClick={() => {
                  this.setState({ termsAndConditionVisible: false });
                }}
              >
                x
              </span>
              <h3>Terms & Conditions:</h3>
              <ul>
                <li>
                  By selecting Pay Online, you agree to charge your card
                  according to the booking you have selected and you have read
                  carefully the booking policies.
                </li>
                <li>
                  The guest can cancel free of charge 14 days before check-in.
                  If the guest wishes to cancel within 14 days before arrival,
                  the total price of the reservation will be charged.
                </li>
              </ul>
              <p className="terms-and-condition-star">
                *This clause does not apply to guests who have a special
                contract with Frank Porter.
              </p>
            </div>
          </>
        ) : null}
        <div className="checkboxes-box">
          <label className="checkbox-box">
            {t("privacyPolicyText")}{" "}
            <Link to="/privacy-policy">{t("privacyPolicy")}</Link>
            <input
              className="checkbox"
              onChange={this.onChange.bind(this)}
              type="checkbox"
              name="privacyPolicy"
            />
            <span className="checkmark"></span>
          </label>
          {this.props.validator.message(
            "privacyPolicy",
            this.state.privacyPolicy,
            "required",
            {
              messages: {
                required: t("common:acceptedValidation", {
                  field: t("privacyPolicy"),
                }),
              },
            }
          )}
          <label className="checkbox-box">
            {t("marketingAgreementText")}
            <input
              className="checkbox"
              type="checkbox"
              onChange={this.onChange.bind(this)}
              name="marketing"
            />
            <span className="checkmark"></span>
          </label>
          <label className="checkbox-box">
            {t("termsAndConditionText")}{" "}
            <a href="/" onClick={this.onTermsAndConditionClick.bind(this)}>
              {t("termsAndCondition")}
            </a>
            <input
              className="checkbox"
              onChange={this.onChange.bind(this)}
              type="checkbox"
              name="termsAndCondition"
            />
            <span className="checkmark"></span>
          </label>
          {this.props.validator.message(
            "termsAndCondition",
            this.state.termsAndCondition,
            "required",
            {
              messages: {
                required: t("common:acceptedValidation", {
                  field: upperFirst(t("termsAndCondition")),
                }),
              },
            }
          )}
          {this.props.i18n.language === "ru" && (
            <>
              <label className="checkbox-box">
                {t("ruConditionText")}{" "}
                <a href={ruCondition} target="_blank" rel="noopener noreferrer">
                  {t("ruCondition")}
                </a>
                <input
                  className="checkbox"
                  onChange={this.onChange.bind(this)}
                  type="checkbox"
                  name="ruCondition"
                />
                <span className="checkmark"></span>
              </label>
              {this.props.validator.message(
                "ruCondition",
                this.state.ruCondition,
                "required",
                {
                  messages: {
                    required: t("common:acceptedValidation", {
                      field: t("ruCondition"),
                    }),
                  },
                }
              )}
            </>
          )}
        </div>
      </>
    );
  }
}

export default PrivacyPolicyAgreements;
