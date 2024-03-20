import i18n from "../i18n"

export const checkForArabic = (className = "", optionalStr) => {
    return i18n.language === "ar" ? className : optionalStr || "";
}