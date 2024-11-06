import React from "react";
import TronLinkGuide from "./TronLinkGuide";
import TronWeb from "tronweb";
import Utils from "../utils";

// import Content from './Content';

import "./App/App.css";

const FOUNDATION_ADDRESS = "TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg";

class Publisher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ads: [],
      ratePerImpression: 0,
      adId: 0,
      publisherId: 0,
      withdrawPublisherId: 0,
      loading: false,
      publisherDetails: {
        creatorAddress: "",
        impressions: "",
        earnings: "",
      },

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
    this.getRatePerImpression();
  }

  //Publisher
  createPublisher = async () => {
    await Utils.contract.createPublisher().send({
      feeLimit: 100000000,
      callValue: 0,
      shouldPollResponse: true,
    });
  };

  checkPublisherDetails = async (publisherId) => {
    const details = await Utils.contract
      .checkPublisherDetails(publisherId)
      .call();
    this.setState((prevState) => ({
      publisherDetails: {
        ...prevState.publisherDetails,
        creatorAddress: details[0],
        impressions: details[1],
        earnings: details[2],
      },
    }));
  };

  handlePublisherId = (event) => {
    this.setState({ publisherId: event.target.value });
  };

  handleGetPublisherDetails = () => {
    this.checkPublisherDetails(this.state.publisherId);
  };

  withdrawEarnings = async (publisherId) => {
    await Utils.contract.withdrawEarnings(publisherId).send({
      shouldPollResponse: true,
    });
  };

  handlePublisherEarnings = (event) => {
    this.setState({ withdrawPublisherId: event.target.value });
  };

  handleWithdrawEarnings = () => {
    this.withdrawEarnings(this.state.withdrawPublisherId);
  };

  getRatePerImpression = async () => {
    const rate = (
      await Utils.contract.getRatePerImpression().call()
    ).toNumber();
    this.setState({ ratePerImpression: rate });
  };

  render() {
    if (!this.state.tronWeb.installed) return <TronLinkGuide />;

    if (!this.state.tronWeb.loggedIn) return <TronLinkGuide installed />;

    return (
      <div className="row">
        <div className="col-lg-12 text-center">
          <h1
            style={{
              color: "#fdfdfd",
              fontSize: "50px",
              fontWeight: "bolder",
              marginTop: "50px",
            }}
          >
            Publisher Dashboard
          </h1>
          <br />
          <br />
          <div>
            <h4 className="pt-2">Create A New Publisher Account </h4>
            <button
              className="btn btn-outline-light rounded-5 px-3"
              onClick={this.createPublisher}
            >
              Create Publisher
            </button>
          </div>
          <br />
          <br />
          <div
            className="d-flex justify-content-center gap-3"
            style={{ maxWidth: "800px", margin: "auto" }}
          >
            <h4 className="pt-2">Get Publisher Details: </h4>
            <input
              type="number"
              name="publisherId"
              onChange={this.handlePublisherDetails}
              placeholder="Publisher ID"
              required
              className="form-control rounded p-2"
              style={{ width: "auto" }}
            />
            <button
              className="btn btn-outline-light rounded-5 px-3"
              onClick={this.handleGetPublisherDetails}
              style={{ whiteSpace: "nowrap" }}
            >
              Publisher Details
            </button>
          </div>
          <br />
          <br />
          <div>
            <div className="row" style={{ margin: "auto" }}>
              <div className="col-md-4">
                <div className="card text-center p-3 h-100">
                  <h4>Creator Address:</h4>
                  <h5 style={{ color: "red" }}>
                    {this.state.publisherDetails.creatorAddress}
                  </h5>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center p-3 h-100">
                  <h4>Impressions:</h4>
                  <h5 style={{ color: "red" }}>
                    {this.state.publisherDetails.impressions.toString()}
                  </h5>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card text-center p-3 h-100">
                  <h4>Earnings (TRX):</h4>
                  <h5 style={{ color: "red" }}>
                    {this.state.publisherDetails.earnings.toString()}
                  </h5>
                </div>
              </div>
            </div>
            <br />
            <br />
            <div
              className="d-flex justify-content-center gap-3"
              style={{ maxWidth: "800px", margin: "auto" }}
            >
              <h4 className="pt-2">Withdraw Earnings: </h4>
              <input
                type="number"
                name="publisherId"
                onChange={this.handlePublisherEarnings}
                placeholder="Publisher ID"
                required
                className="form-control rounded p-2"
                style={{ width: "auto" }}
              />
              <button
                className="btn btn-outline-light rounded-5 px-3"
                onClick={this.handleWithdrawEarnings}
                style={{ whiteSpace: "nowrap" }}
              >
                Withdraw Earnings
              </button>
            </div>
            <br />
            <br />
            <h4>Current Rate Per Impression: {this.state.ratePerImpression}</h4>
          </div>
          <br />
          <br />
        </div>
      </div>
    );
  }
}

export default Publisher;
