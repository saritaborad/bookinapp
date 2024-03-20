import React from "react";
import i18n from "../../i18n";
import { storageService } from "../../services/storageService";
import settings from "../../settings";

class LanguageSelector extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectorVisible: false,
      selectedLanguage: settings.languages[0]
    };
  }

  componentDidMount() {
    this.getUserLanguage();
  }

  getUserLanguage() {
    const userLang = localStorage.getItem(settings.userLaguague);

    if(userLang){
      this.findAndSetLang(userLang);
      return;
    }
    const language = window.navigator.language;
    
    
    if (language) {
      this.findAndSetLang(language);
    }
  }

  findAndSetLang(language){
    const splittedLang = language.split("-");
    
      const foundLang = settings.languages.find(
        lang => lang.name1 === splittedLang[0]
      );
      this.setState({
        selectedLanguage: foundLang ? foundLang : settings.languages[0]
      }, ()=>{
        i18n.changeLanguage(this.state.selectedLanguage.name1);
      });
  }

  toggleSelector() {
    this.setState({
      selectorVisible: !this.state.selectorVisible
    });
  }

  hideSelector() {
    this.setState({
      selectorVisible: false
    });
  }

  selectLanguage(value, event) {
    this.setState({ selectedLanguage: value });
    i18n.changeLanguage(value.name1);
    storageService.saveStorageIfPossible(settings.userLaguague, value.name1);
  }

  render() {
    return (
      <div
        className="language-selector"
        onClick={this.toggleSelector.bind(this)}
      >
        <span className="selected-language">
        
          {this.state.selectedLanguage.name2}
        </span>
        <div
          className={
            "triangle-selector" + (this.state.selectorVisible ? " rotate" : "")
          }
        ></div>
        {this.state.selectorVisible ? (
          <div className="language-block">
            <div
              className="overlay"
              onClick={this.hideSelector.bind(this)}
            ></div>
            <div className="languages-list-content">
              <ul>
                {settings.languages.map(lang => (
                  <li
                    key={lang.id}
                    onClick={this.selectLanguage.bind(this, lang)}
                  >
                    {lang.name2}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default LanguageSelector;
