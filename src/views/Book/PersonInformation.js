import React from "react";
import IntlTelInput from "react-intl-tel-input";

class PersonInformation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      formatedNumber: "",
      message: ""
    };
    this.myRef = React.createRef();
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.mapPropsToState(props);
  }

  mapPropsToState(props) {
    this.setState({
      firstName: props.firstName,
      lastName: props.lastName,
      email: props.email,
      message: props.message
    });
  }

  onNumberChange(valid, number, prefix, formatedNumber) {
    this.setState({
      phone: number,
      formatedNumber: formatedNumber
    });
    this.props.validator.rules.phone.rule = () => valid;
    this.props.formatedNumberChange(formatedNumber);
  }

  onSelectFlag(number, prefix, formatedNumber) {
    this.setState({ formatedNumber: formatedNumber });
    this.props.validator.rules.phone.rule = () =>
      this.myRef.current.isValidNumber(formatedNumber);
    this.forceUpdate();
    this.props.formatedNumberChange(formatedNumber);
  }

  render() {
    const { t } = this.props;
    return (
      <div className="guest-details-forms">
        <div className="form-group">
          <input
            type="text"
            placeholder={t("firstName")}
            name="firstName"
            value={this.state.firstName}
            onChange={this.props.onChange.bind(this)}
          />
          {this.props.validator.message(
            "firstName",
            this.state.firstName,
            "required",
            {
              messages: {
                required: t("common:requiredValidation", {
                  field: t("firstName")
                })
              }
            }
          )}
        </div>

        <div className="form-group">
          <input
            type="text"
            name="lastName"
            placeholder={t("lastName")}
            value={this.state.lastName}
            onChange={this.props.onChange.bind(this)}
          />
          {this.props.validator.message(
            "lastName",
            this.state.lastName,
            "required",
            {
              messages: {
                required: t("common:requiredValidation", {
                  field: t("lastName")
                })
              }
            }
          )}
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder={t("email")}
            name="email"
            onChange={this.props.onChange.bind(this)}
            value={this.state.email}
          />
          {this.props.validator.message(
            "email",
            this.state.email,
            "required|email",
            {
              messages: {
                required: t("common:requiredValidation", {
                  field: t("email")
                }),
                email: t("common:emailValidation", {
                  field: t("email")
                })
              }
            }
          )}
        </div>
        <div className="form-group">
          <IntlTelInput
            ref={this.myRef}
            fieldName="phone"
            defaultCountry={"ae"}
            preferredCountries={["ru", "ae"]}
            containerClassName="intl-tel-input"
            inputClassName="form-control"
            placeholder={t("phone")}
            onPhoneNumberChange={this.onNumberChange.bind(this)}
            onSelectFlag={this.onSelectFlag.bind(this)}
            value={this.state.phone}
          />
          {this.props.validator.message(
            "phone",
            this.state.phone,
            "required|phone",
            {
              messages: {
                required: t("common:requiredValidation", {
                  field: t("phone")
                }),
                phone: t("common:phoneValidation", {
                  field: t("phone")
                })
              }
            }
          )}
        </div>
        <div className="form-group">
          <textarea
            className="message-input"
            name="message"
            placeholder={t("message")}
            value={this.state.message}
            onChange={this.props.onChange.bind(this)}
          />
        </div>
      </div>
    );
  }
}

export default PersonInformation;
