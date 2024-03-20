import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { searchService } from "../../services/searchService";
import PropertyItem from "../Search/PropertyItem";
import SearchMap from "../Search/SearchMap";
import "./About.scss";

class About extends Component {
  constructor(props) {
    super(props);

    this.state = {
      listings: null,
      downloading: true,
    };

    this.getNewListings();
  }

  componentDidMount() {
    this.props.onCityUpdate(null);
  }

  featuredListings = [
    "5b702619466553002a4e1487",
    "5c693a6ff14c26003c8bc2d6",
    "5cb56ef61499e7003d462572",
    "5cda5a5f8ef2d50030d2d503",
    "5cee246b79af290068a30df0",
    "5cfa009763094000b695467b",
    "5cfdf590547ddf0068673ea8",
    "5d0b50271bd5cf008fd6c967",
    "5d3e93d8bde1e9004a78bfb1",
    "5d4a76294ce1f3005bb7724a",
    "5d4fb9add7b4fe002d72fd9c",
  ];

  getNewListings() {
    searchService
      .getCertainListings(this.featuredListings)
      .then((response) => {
        this.setState({ listings: response.results, downloading: false });
      })
      .catch(() => {
        this.setState({ downloading: false });
      });
  }

  onPropertyClick(property) {
    this.props.history.push("/details/" + property._id);
  }

  render() {
    const { t } = this.props;
    return (
      <div className="subpage-container about-container">
        <h1 className="header">{t("common:frankPorter")}</h1>
        <p className="description">{t("aboutDescription1")}</p>
        <p className="description">{t("aboutDescription2")}</p>
        <h2 className="new-properties">{t("newProperties")}</h2>
        <div className="properties">
          {this.state.listings &&
            this.state.listings.map((property) => (
              <PropertyItem
                onClick={this.onPropertyClick.bind(this, property)}
                key={property._id}
                property={property}
                simpleView
                {...this.props}
                onPropertyHover={() => {}}
              />
            ))}
        </div>
        {this.state.downloading ? (
          <div className="loader"></div>
        ) : (
          <SearchMap properties={this.state.listings} zoom={14} />
        )}
      </div>
    );
  }
}

export default withTranslation("about")(About);
