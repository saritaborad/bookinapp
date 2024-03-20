import React, { useMemo } from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import settings from "../../settings";
import "./Footer.scss";
import { checkForArabic } from "../../helpers/arabicLangValidator";

const Footer = ({ t, i18n, selectedTag }) => {
  const isEnglishFooter = useMemo(() => {
    if (selectedTag) {
      return selectedTag.tag === 'DXB' || selectedTag.tag === 'AUH';
    }

    return window.IS_UAE;
  }, [selectedTag]);

  const menuItems = settings.menuItems.filter(
    (menu) =>
      menu.visibleBottomMenu && !menu.hiddenInLanguages.includes(i18n.language)
  );

  const trackMail = () => {
    if (window.IS_UAE && window.gtag) {
      window.gtag("event", "contact_mail_click", {});
    }
    if (window.IS_UAE && window.fbq) {
      window.fbq("trackCustom", "contact_mail_click");
    }
  };

  const trackPhone = () => {
    if (window.IS_UAE && window.gtag) {
      window.gtag("event", "contact_phone_click", {});
    }
    if (window.IS_UAE && window.fbq) {
      window.fbq("trackCustom", "contact_phone_click");
    }
  };

  return (
    <footer className="footer">
      <div className="footer-menu2">
        <div className={`left-decor address ${checkForArabic("arabic-right-decor")}`}>
          <>
            <p>{t("address3rdLine" + (isEnglishFooter ? "En" : "Ru"))}</p>
            <p>
              <a
                onClick={trackMail}
                href={`mailto:${t(
                  "address2ndLine" + (isEnglishFooter ? "En" : "Ru")
                )}`}
              >
                {t("address2ndLine" + (isEnglishFooter ? "En" : "Ru"))}
              </a>
              <a
                onClick={trackPhone}
                className="phoneNumber"
                href={`tel:${t(
                  "address1stLine" + (isEnglishFooter ? "En" : "Ru")
                )}`}
              >
                {t("address1stLine" + (isEnglishFooter ? "En" : "Ru"))}
              </a>
            </p>
            {!isEnglishFooter && (
              <>
                <p>По вопросам бронирования - Доб. 3051, 3053</p>
                <p>По вопросам управления - Доб. 3050</p>
              </>
            )}
          </>
          <p>
            {menuItems.map((menu) => (
              <Link key={menu.url} to={`/${menu.url}`}>
                {t(menu.translationKey)}
              </Link>
            ))}
          </p>
        </div>
      </div>
      <div className="social-media">
        {/* <a
          className="ico-link"
          rel="noopener noreferrer"
          target="_blank"
          href={t("twitterUrl")}
        >
          <i className="ico ico-twitter" />
        </a> */}
        <a
          className="ico-link"
          rel="noopener noreferrer"
          target="_blank"
          href={`https://www.instagram.com/${
            window.IS_UAE ? "mrfrankporter/" : "mrfrankporter.ru/"
          }`}
        >
          <i className="ico ico-instagram" />
        </a>
        {/* <a
          className="ico-link"
          rel="noopener noreferrer"
          target="_blank"
          href={t("facebookUrl")}
        >
          <i className="ico ico-facebook" />
        </a> */}
      </div>
    </footer>
  );
};

export default withTranslation("common")(Footer);
