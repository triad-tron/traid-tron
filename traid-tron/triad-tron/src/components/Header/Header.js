import React from "react";
import { Link } from "react-router-dom";

import "./App.css";

const Header = () => {
  return (
    <header className="newheader">
      <div style={{ flex: "2", paddingLeft: "50px" }}>
      <Link
  to="/"
  style={{
    margin: "0 10px",
    fontSize: "50px",
    color: "red",
    fontWeight: "bolder",
    textDecoration: "none"
  }}
>
  <img src="./logo.png" alt="logo" style={{ marginRight: "10px", width: "75px", marginBottom: "10px"}} />
  TriAd
</Link>
      </div>
      <nav style={{ flex: "10", textAlign: "right" }}>
        <Link
          to="/admin"
          className="bg-white text-danger rounded px-3 py-2 mx-2 text-decoration-none fw-bold"
          style={{ fontSize: "30px" }}
        >
          Admin
        </Link>
        <Link
          to="/advertisers"
          className="bg-white text-danger rounded px-3 py-2 mx-2 text-decoration-none fw-bold"
          style={{ fontSize: "30px" }}
        >
          Advertisers
        </Link>
        <Link
          to="/publisher"
          className="bg-white text-danger rounded px-3 py-2 mx-2 text-decoration-none fw-bold"
          style={{ fontSize: "30px" }}
        >
          Publisher
        </Link>
        <Link
          to="/site"
          className="bg-white text-danger rounded px-3 py-2 mx-2 text-decoration-none fw-bold"
          style={{ fontSize: "30px" }}
        >
          Site
        </Link>
      </nav>
      <div style={{ flex: "1" }}></div>
    </header>
  );
};

export default Header;
