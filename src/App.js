import React, { useEffect } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import "./App.scss";
import "./interceptors/fpAdminApiInterceptor";
import "./interceptors/guestyApiInterceptor";
import "./services/authService";
import Home from "./views/Home/Home";
import Layout from "./views/_Layout/Layout";

const App = () => {
  useEffect(() => {
    if (window.location.href.indexOf("/#/") > -1) {
      window.location.assign(window.location.href.replace("/#/", "/"));
    }
  }, []);

  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact render={(props) => <Home {...props} />} />
        <Layout />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
