import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { userService } from "../../services/userService";
import settings from "../../settings";
import "./Contact.scss";

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      subject: "",
      showSubjectDropdown: false,
      subjectPlaceholder: "",
      message: "",
      sendingEmail: false,
      emailSent: false,
      emailError: false,
      popupVisible: props.popupVisible,
    };
  }

  onChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  subjectDropdownToggle() {
    this.setState({
      showSubjectDropdown: !this.state.showSubjectDropdown,
    });
  }

  hideSelector() {
    this.setState({
      showSubjectDropdown: false,
    });
  }

  onSubjectClicked(subject, id) {
    if (id !== 4) {
      return this.setState({
        subject,
        subjectPlaceholder: "",
        showSubjectDropdown: false
      });
    }

    this.setState({
      subject: "",
      subjectPlaceholder: this.props.t("subjects:enterSubject"),
      showSubjectDropdown: false
     });
  }

  closePopup() {
    this.props.setContactVisible(false);
    this.setState({ emailSent: false });
    return;
  }

  sendEmail(event) {
    event.preventDefault();
    this.setState({
      sendingEmail: true,
      emailError: false,
      emailSent: false,
    });
    const language = this.props.selectedTag
      ? this.props.selectedTag.language
      : this.props.i18n.language;

    userService
      .sendContactEmail(
        this.state.name,
        this.state.email,
        this.state.subject,
        this.state.message,
        language
      )
      .then(() => {
        this.setState({
          name: "",
          email: "",
          subject: "",
          message: "",
          sendingEmail: false,
          emailSent: true,
        });
      })
      .catch(() => {
        this.setState({
          sendingEmail: false,
          emailError: true,
        });
      });
  }

  render() {
    return (
      <>
        {this.state.popupVisible ? <div className="modal-overlay"></div> : null}
        <div className={
            "popup contact-popup" + (this.state.popupVisible ? "" : " hidden")
          }
        >
          {this.state.emailSent && (
            <div style={{ textAlign: "center" }}>
              <div className="sent-email">{this.props.t("emailSent")}</div>
              <button
                className={"button"}
                type="submit"
                style={{ width: "200px", marginTop: "3rem" }}
                onClick={this.closePopup.bind(this)}
              >
                {this.props.t("close")}
              </button>
            </div>
          )}
          {!this.state.emailSent && (
            <form onSubmit={this.sendEmail.bind(this)} className="contact-form">
              <span
                className="close-modal"
                onClick={this.closePopup.bind(this)}
              >
                x
              </span>
              <div className="contact-header">
                <p className="contact-me">{this.props.t("contactMe")}</p>
              </div>
                <p className="contact-text">{this.props.t("contactText")}</p>
              <div className="columns-container">
                <div className="first-column">
                  <div className="input-container">
                    <input
                      type="text"
                      name="name"
                      onChange={this.onChange.bind(this)}
                      required
                      disabled={this.state.sendingEmail}
                      value={this.state.name}
                      placeholder={this.props.t("name")}
                    />
                  </div>
                  <div className="input-container">
                    <input
                      type="email"
                      name="email"
                      required
                      disabled={this.state.sendingEmail}
                      onChange={this.onChange.bind(this)}
                      value={this.state.email}
                      placeholder={this.props.t("email")}
                    />
                  </div>
                  <div className="dropdown-container">
                    <input
                      type="text"
                      name="subject"
                      disabled={this.state.sendingEmail}
                      required
                      onClick={this.state.subjectPlaceholder !== this.props.t("subjects:enterSubject") && this.subjectDropdownToggle.bind(this)}
                      onChange={this.onChange.bind(this)}
                      value={this.state.subject}
                      placeholder={this.state.subjectPlaceholder ? this.state.subjectPlaceholder : this.props.t("subject")}
                      readOnly={this.state.subjectPlaceholder !== this.props.t("subjects:enterSubject")}
                      className={"dropdown-input " + (this.state.subjectPlaceholder === this.props.t("subjects:enterSubject") ? "text-cursor": "")}                      
                    />
                    <div
                      onClick={this.subjectDropdownToggle.bind(this)}
                      className={
                        "dropdown-triangle" +
                        (this.state.showSubjectDropdown ? " rotate" : "")
                      }
                    ></div>
                    {this.state.showSubjectDropdown ? (
                      <div
                        className="overlay"
                        onClick={this.hideSelector.bind(this)}
                      ></div>
                    ) : null}
                    <ul
                      className={
                        "dropdown" + (this.state.showSubjectDropdown ? " show" : "")
                      }
                    >
                      {settings.subjects.map((subject) => (
                        <li
                          onClick={this.onSubjectClicked.bind(this, this.props.t(subject.translationKey), subject.id)}
                          key={subject.id}
                        >
                          {this.props.t(subject.translationKey)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="textarea-container">
                  <textarea
                    onChange={this.onChange.bind(this)}
                    required
                    disabled={this.state.sendingEmail}
                    name="message"
                    value={this.state.message}
                    placeholder={this.props.t("yourMessage")}
                  ></textarea>
                  <button
                    className={
                      "button" + (this.state.sendingEmail ? " loading" : "")
                    }
                    type="submit"
                    disabled={this.state.sendingEmail}
                  >
                    {this.props.t(this.state.sendingEmail ? "sending" : "send")}
                    <div className="loader"></div>
                  </button>
                  {this.state.emailError ? (
                    <div className="sending-email-error">
                      {this.props.t("emailSendingError")}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </>
    );
  }
}
export default withTranslation("common")(Contact);
