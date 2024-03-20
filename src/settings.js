import {
  compareObjects,
  getQueryParameters,
  referenceObj,
} from "./helpers/settingsHelper";

const settings = {
  languages: [
    { id: 1, name1: "en", name2: "eng" },
    { id: 2, name1: "ru", name2: "rus" },
    { id: 3, name1: "fr", name2: "fre" },
    { id: 4, name1: "ar", name2: "ara" },
  ],
  marketingAgreement: "marketing_agreement",
  userLaguague: "user_language",

  frankPorterApiUrl: process.env.REACT_APP_FP_ADMIN_URL,
  guestyApiUrl: process.env.REACT_APP_FP_ADMIN_URL + "/admin/tools/hproxy/v1",
  frankPorterWebsite: process.env.REACT_APP_FP_WEBSITE_URL,
  frankPorterPayUrl: process.env.REACT_APP_FP_PAY_URL,

  itemsPerPage: () => {
    const queryParams = getQueryParameters();
    const isMatch = compareObjects(queryParams, referenceObj);
    return isMatch ? 100 : 21;
  },
  actualItemsPerPage: 21,
  accountId: "5b686412cdbb89003d8323b6",
  apiUsername: "FP-Owner",
  apiPassword: "QXGF4Zr84QoP)fRZa",
  subjects: [
    { id: 1, translationKey: "subjects:rentShortTerm" },
    { id: 2, translationKey: "subjects:bookApartment" },
    { id: 3, translationKey: "subjects:comments" },
    { id: 4, translationKey: "subjects:others" },
  ],
  citiesTags: [
    {
      tag: "DXB",
      urlName: "dubai",
      displayName: "Dubai",
      tagsAvailable: true,
      language: "en",
      visible: window.IS_UAE,
    },
    {
      tag: "AUH",
      urlName: "abudhabi",
      displayName: "Abu Dhabi",
      tagsAvailable: false,
      language: "en",
      visible: window.IS_UAE,
    },
    {
      tag: "LED",
      urlName: "stpetersburg",
      displayName: "St. Petersburg",
      tagsAvailable: false,
      language: "ru",
      visible: !window.IS_UAE,
    },
  ],
  tagsDubai: [
    {
      tag: "Business Bay",
      translationKey: "tags:businessBay",
    },
    {
      tag: "City Walk / Jumeirah",
      translationKey: "tags:cityWalk/Jumeirah",
    },
    {
      tag: "DIFC",
      translationKey: "tags:difc",
    },
    {
      tag: "Downtown Dubai",
      translationKey: "tags:downtownDubai",
    },
    {
      tag: "Dubai Marina",
      translationKey: "tags:dubaiMarina",
    },
    {
      tag: "JBR",
      translationKey: "tags:jbr",
    },
    {
      tag: "JLT",
      translationKey: "tags:jlt",
    },
    {
      tag: "JVC / JVT",
      translationKey: "tags:jvc/jvt",
    },
    {
      tag: "Palm Jumeirah",
      translationKey: "tags:palmJumeirah",
    },
    {
      tag: "Production/Sports/Motor City",
      translationKey: "tags:production/sports/motorCity",
    },
    {
      tag: "Springs / Meadows",
      translationKey: "tags:springs/meadows",
    },
    {
      tag: "Tecom / Greens",
      translationKey: "tags:recom/greens",
    },
    {
      tag: "Villas",
      translationKey: "tags:villas",
    },
    {
      tag: "Greater Dubai",
      translationKey: "tags:greaterDubai",
    },
    {
      tag: "Za'abeel",
      translationKey: "tags:zaAbeel",
    },
  ],
  tagsAbuDhabi: [
    {
      tag: "Al Saadiyat",
      translationKey: "tags:alSaadiyat",
    },
  ],
  tagsStpetersburg: [
    {
      tag: "PTRGRD",
      translationKey: "tags:petrogradskiyIsland",
    },
    {
      tag: "VO",
      translationKey: "tags:vasilievskiyIsland",
    },
    {
      tag: "KOLOMN",
      translationKey: "tags:kolomna",
    },
    {
      tag: "VOSTN",
      translationKey: "tags:ploshadVosstania",
    },
    {
      tag: "LITEINY",
      translationKey: "tags:liteiniy",
    },
    {
      tag: "ADMRL",
      translationKey: "tags:admiralteiskiyDistrict",
    },
    {
      tag: "PRIM",
      translationKey: "tags:primorskiyDistrict",
    },
    {
      tag: "MOSK",
      translationKey: "tags:airport",
    },
    {
      tag: "5UGL",
      translationKey: "tags:piyatUglov",
    },
  ],
  bedrooms: [
    { name: "Studio", translationKey: "common:studio", values: [0] },
    { name: "1BR", translationKey: "common:1br", values: [1] },
    { name: "2BR", translationKey: "common:2br", values: [2] },
    { name: "3BR", translationKey: "common:3br", values: [3] },
    { name: "4BR", translationKey: "common:4br", values: [4] },
    { name: "5BR", translationKey: "common:5br", values: [5, 6, 7, 8, 9, 10] },
  ],
  sortMethods: [
    {
      translationKey: "search:default",
      key: "default",
      reservationKey: "default",
    },
    {
      translationKey: "search:price",
      key: "prices.basePrice",
      reservationKey: "reservation.pricePerNight",
    },
  ],
  stripeAccount: "acct_1Be30yJjR8Qiquyz",
  stripeApiKey: "pk_live_P0FSIEtbwU1GSvgvEM3DYuUZ",
  menuItems: [
    {
      url: `search?city=${
        window.IS_UAE ? "dubai" : "stpetersburg"
      }&guests=1&sort=search:default&page=1`,
      translationKey: "home",
      hiddenInLanguages: [],
      visibleTopMenu: true,
      visibleBottomMenu: false,
    },
    {
      url: "contact",
      translationKey: "contact",
      hiddenInLanguages: [],
      visibleTopMenu: true,
      visibleBottomMenu: false,
      onClickFunction: () => {},
    },
    {
      url: "services",
      translationKey: "services",
      hiddenInLanguages: [],
      visibleTopMenu: true,
      visibleBottomMenu: false,
    },
    {
      url: "privacy-policy",
      translationKey: "privacyPolicy",
      hiddenInLanguages: [],
      visibleTopMenu: true,
      visibleBottomMenu: true,
    },
  ],
};

export default settings;
