import React from "react";
import allAmenities from "../../helpers/amenities";
import requiredIconMap from "../../helpers/iconsMap";

const defaultIcon = "elevator";

const amenities = ({ amenities, showAllAmenities }) => {
  const amenitiesLowerCase = amenities.map((x) => x.toLowerCase());

  const getDefaultQuantity = () => {
    const width = window.innerWidth;
    if (width <= 992) {
      return Math.floor(width / 180) * 2;
    }
    return Math.floor((width - 30) / 220) * 2;
  };

  let amenitiesPool = allAmenities.filter((a) =>
    amenitiesLowerCase?.includes(a.pordalCode) || amenitiesLowerCase.includes(a.lowerCase)
  );
  if (!showAllAmenities) {
    amenitiesPool = amenitiesPool.slice(0, getDefaultQuantity());
  }

  const amenitiesToShow = amenitiesPool.map((a, i) => {
    const iconUrl = requiredIconMap[a.icon || defaultIcon].default;
    return (
      <div key={i} className="amenity">
        <img src={iconUrl} alt={a.text} />
        <span>{a.text}</span>
      </div>
    );
  });

  return <div className="amenities-list">{amenitiesToShow}</div>;
};

export default amenities;
