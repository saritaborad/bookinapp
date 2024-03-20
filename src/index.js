import React from "react";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import ReactDOM from "react-dom";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import App from "./App";
import "./i18n";
import "./index.scss";
import "./styles/main.scss";

process.env.REACT_APP_SENTRY_ENABLED === 'true' && Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  tracesSampleRate: parseFloat(process.env.REACT_APP_SENTRY_SAMPLE_RATE),
});

ReactDOM.render(<App />, document.getElementById("root"));
