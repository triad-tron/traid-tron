import React from "react";
import TronLinkGuide from "../TronLinkGuide";
import TronWeb from "tronweb";
import Utils from "../../utils";
import { Link } from "react-router-dom";

// import Content from './Content';

import "./App.css";

const FOUNDATION_ADDRESS = "TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      tronWeb: {
        installed: false,
        loggedIn: false,
      },
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });
    await new Promise((resolve) => {
      const tronWebState = {
        installed: !!window.tronWeb,
        loggedIn: window.tronWeb && window.tronWeb.ready,
      };

      if (tronWebState.installed) {
        this.setState({
          tronWeb: tronWebState,
        });

        return resolve();
      }

      let tries = 0;

      const timer = setInterval(() => {
        if (tries >= 10) {
          const TRONGRID_API = "https://api.trongrid.io";

          window.tronWeb = new TronWeb(
            TRONGRID_API,
            TRONGRID_API,
            TRONGRID_API
          );

          this.setState({
            tronWeb: {
              installed: false,
              loggedIn: false,
            },
          });

          clearInterval(timer);
          return resolve();
        }

        tronWebState.installed = !!window.tronWeb;
        tronWebState.loggedIn = window.tronWeb && window.tronWeb.ready;

        if (!tronWebState.installed) return tries++;

        this.setState({
          tronWeb: tronWebState,
        });

        resolve();
      }, 100);
    });

    if (!this.state.tronWeb.loggedIn) {
      // Set default address (foundation address) used for contract calls
      // Directly overwrites the address object as TronLink disabled the
      // function call
      window.tronWeb.defaultAddress = {
        hex: window.tronWeb.address.toHex(FOUNDATION_ADDRESS),
        base58: FOUNDATION_ADDRESS,
      };

      window.tronWeb.on("addressChanged", () => {
        if (this.state.tronWeb.loggedIn) return;

        this.setState({
          tronWeb: {
            installed: true,
            loggedIn: true,
          },
        });
      });
    }
    await Utils.setTronWeb(window.tronWeb);
    this.setState({ loading: false });
  }

  render() {
    if (!this.state.tronWeb.installed) return <TronLinkGuide />;

    if (!this.state.tronWeb.loggedIn) return <TronLinkGuide installed />;

    return (
      <div className="row">
        <div className="col-lg-12 text-center">
          <p
            style={{
              fontSize: "100px",
              fontWeight: "bolder",
              color: "#fdfdfd",
            }}
          >
            TriAd
          </p>
          <p
            style={{
              fontSize: "50px",
              fontWeight: "bolder",
              color: "#fdfdfd",
              marginBottom: "50px",
            }}
          >
            Ditch the middleman! Triad is a decentralized ad exchange which uses
            blockchain to directly connect advertisers and publishers in
            transparent way, offering lower fees and more control for everyone.
          </p>
          <Link
  to="/advertiser"
  className="bg-white text-danger rounded px-4 py-4 mx-2 text-decoration-none fw-bold"
  style={{ fontSize: "30px" }}
>
  Advertiser Dashboard
</Link>
          <Link
            to="/publisher"
            className="bg-white text-danger rounded px-4 py-4 mx-2 text-decoration-none fw-bold"
  style={{ fontSize: "30px" }}
          >
            Publisher Dashboard
          </Link>
          <div>
            <p
              style={{
                fontSize: "50px",
                fontWeight: "bolder",
                color: "#fdfdfd",
                marginTop: "50px",
              }}
            >
              Why Bother?
            </p>
            <h2>Problems With Traditional Advertisement Exchanges</h2>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <li
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  margin: "10px",
                }}
              >
                <h4 style={{ color: "#000000" }}>Not Serving Web3 </h4>
                <p style={{ color: "#000000" }}>
                  They don't serve Web3 platforms and publishers, hindering the
                  growth of the decentralized web.
                </p>
              </li>
              <li
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  margin: "10px",
                }}
              >
                <h4 style={{ color: "#000000" }}>Limited Payment Options</h4>
                <p style={{ color: "#000000" }}>
                  They often do not support cryptocurrency transactions, which
                  are pivotal for Web3 ecosystems, coupled with inefficient
                  payment processes.
                </p>
              </li>
              <li
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  margin: "10px",
                }}
              >
                <h4 style={{ color: "#000000" }}>Economic Opacity</h4>
                <p style={{ color: "#000000" }}>
                  There's a lack of clear visibility into the financial aspects,
                  such as earnings, spending, and the fees involved, leaving
                  participants in the dark about the economic value chain.
                </p>
              </li>
              <li
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  margin: "10px",
                }}
              >
                <h4 style={{ color: "#000000" }}>Analytical Opacity</h4>
                <p style={{ color: "#000000" }}>
                  Both advertisers and publishers face a veil over crucial
                  metrics like impressions, clicks, and conversion rates,
                  hindering informed decision-making.
                </p>
              </li>
            </div>
          </div>

          <div>
            <p
              style={{
                fontSize: "50px",
                fontWeight: "bolder",
                color: "#fdfdfd",
                marginTop: "50px",
              }}
            >
              This is Why.
            </p>
            <h2>These are the Solutions Tri-Ad offers</h2>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <li
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  margin: "10px",
                }}
              >
                <h4 style={{ color: "#000000" }}>Web3 & Web2 Friendly:</h4>
                <p style={{ color: "#000000" }}>
                  Seamlessly serves both Web3 platforms (dApps, metaverse) and
                  traditional Web2 publishers, broadening audience reach for
                  advertisers.
                </p>
              </li>
              <li
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  margin: "10px",
                }}
              >
                <h4 style={{ color: "#000000" }}>Crypto Payments: </h4>
                <p style={{ color: "#000000" }}>
                  Integrates cryptocurrency transactions for efficiency and
                  convenience, utilizing Tron's fast and low-cost transaction
                  capabilities.
                </p>
              </li>
              <li
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  margin: "10px",
                }}
              >
                <h4 style={{ color: "#000000" }}>Transparent Economics:</h4>
                <p style={{ color: "#000000" }}>
                  Provides full visibility into earnings, spending, and fees,
                  building trust through blockchain transparency.
                </p>
              </li>
              <li
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "20px",
                  backgroundColor: "#f9f9f9",
                  margin: "10px",
                }}
              >
                <h4 style={{ color: "#000000" }}>Real-Time Analytics:</h4>
                <p style={{ color: "#000000" }}>
                  Offers detailed, blockchain-verifiable insights into ad
                  performance metrics like impressions, clicks, and conversions.
                </p>
              </li>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
