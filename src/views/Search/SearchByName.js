import React from "react";

export const SearchByName = (props) => {
  const {
    t,
    searchByNameVisible,
    submitSearchText,
    searchByNameToggle,
    onChangeHandler,
    searchText,
    resetFreeText,
  } = props;
  return (
    <>
      {searchByNameVisible ? <div className="modal-overlay"></div> : null}
      <div
        className={
          "search-by-name-popup" + (searchByNameVisible ? "" : " hidden")
        }
      >
        <form onSubmit={submitSearchText} className="search-by-name-form">
          <span className="close-modal" onClick={searchByNameToggle}>
            x
          </span>
          <div className="search-by-name-header">
            <p className="header">{t("searchByName")}</p>
          </div>
          <div className="columns-container">
            <div className="input-container">
              <input
                type="text"
                className="free-text-input"
                onChange={onChangeHandler}
                value={searchText}
                name="searchText"
                placeholder={t("name")}
              />
            </div>
            <button className="button" type="submit">
              {t("search")}
            </button>
            {searchText?.length > 0 && (
              <button className="button" onClick={resetFreeText} type="button">
                {t("clear")}
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
};

export default SearchByName;
