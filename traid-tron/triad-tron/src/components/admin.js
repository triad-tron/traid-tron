import React from "react";
import TronLinkGuide from "./TronLinkGuide";
import TronWeb from "tronweb";
import Utils from "../utils";

// import Content from './Content';

import "./style.css";

const FOUNDATION_ADDRESS = "TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg";

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ads: [],
      rate: 0,
      ratePerImpression: 0,
      adId: 0,
      amount: 0,
      totalAds: 0,
      contractBalance: 0,
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
    this.fetchData();
    this.setState({ loading: false });
    this.getContractBalance();
    this.getRatePerImpression();
  }

  async fetchData() {
    const adsCount = (await Utils.contract.adId().call()).toNumber();
    console.log("Ads", adsCount);
    this.setState({ totalAds: adsCount });

    for (var i = 0; i < adsCount; i++) {
      const ads_tmp = await Utils.contract.ads(i).call();
      console.log("ads_tmp", ads_tmp);

      const ads = [...this.state.ads];

      ads.push({
        id: i,
        name: ads_tmp.name,
        description: ads_tmp.description,
        mediaFileLink: ads_tmp.mediaFileLink,
        linkToTarget: ads_tmp.linkToTarget,
        impressionsCount: parseInt(ads_tmp.impressionsCount._hex, 16),
        impressionsCountLimit: parseInt(ads_tmp.impressionsCountLimit._hex, 16),
        budget: parseInt(ads_tmp.budget._hex, 16) / 1000000,
        advertiserAddress: ads_tmp.advertiserAddress,
      });

      this.setState({ ads: ads });
    }
  }

  //Admin
  setRatePerImpression = async (rate) => {
    await Utils.contract.setRatePerImpression(rate).send({
      feeLimit: 100000000,
      callValue: 0,
      shouldPollResponse: true,
    });
  };

  handleRateChange = (event) => {
    this.setState({ rate: event.target.value });
  };

  handleButtonClick = () => {
    this.setRatePerImpression(this.state.rate);
  };

  getContractBalance = async () => {
    const balanceWei = (
      await Utils.contract.getContractBalance().call()
    ).toNumber();
    const balance = parseFloat(balanceWei / 1000000);
    this.setState({ contractBalance: balance });
  };

  getRatePerImpression = async () => {
    const rate = (
      await Utils.contract.getRatePerImpression().call()
    ).toNumber();
    this.setState({ ratePerImpression: rate });
  };

  withdrawSurplus = async (amount) => {
    const convertedAmount = amount * 1000000;
    await Utils.contract.withdrawSurplus(convertedAmount).send({
      shouldPollResponse: true,
    });
  };

  handleAmountWithdraw = (event) => {
    this.setState({ amount: event.target.value });
  };

  handleWithdrawSurplus = () => {
    this.withdrawSurplus(this.state.amount);
  };

  removeAd = async (adId) => {
    await Utils.contract.removeAdIfLimitReached(adId).send({
      feeLimit: 100000000,
      callValue: 0,
      shouldPollResponse: true,
    });
  };

  handleRemoveAd = (event) => {
    this.setState({ adId: event.target.value });
  };

  handleRemoveAdButton = () => {
    this.removeAd(this.state.adId);
  };

  render() {
    if (!this.state.tronWeb.installed) return <TronLinkGuide />;

    if (!this.state.tronWeb.loggedIn) return <TronLinkGuide installed />;

    return (
      <div className="row ">
        <div className="col-lg-12 text-center">
          <h1
            style={{
              color: "#fdfdfd",
              fontSize: "50px",
              fontWeight: "bolder",
              marginTop: "50px",
            }}
          >
            Admin Dashboard
          </h1>
          <br />

          <div className="row" style={{ margin: "auto" }}>
            <div className="col-md-4">
              <div className="card text-center p-3 h-100">
                <h4>Ads Count:</h4>
                <h2 style={{ color: "red" }}>{this.state.totalAds}</h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center p-3 h-100">
                <h4>Contract Balance:</h4>
                <h2 style={{ color: "red" }}>
                  {this.state.contractBalance} TRX
                </h2>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center p-3 h-100">
                <h4>Current Rate Per Impression:</h4>
                <h2 style={{ color: "red" }}>
                  {this.state.ratePerImpression} TRX
                </h2>
              </div>
            </div>
          </div>
          <br />
          <br />

          <div
            className="d-flex justify-content-center gap-3"
            style={{ maxWidth: "800px", margin: "auto" }}
          >
            <h4 className="pt-2">Set Rate Per Impression:</h4>
            <input
              type="number"
              name="ratePerImpression"
              onChange={this.handleRateChange}
              placeholder="Rate Per Impression"
              required
              className="form-control rounded p-2"
              style={{ width: "auto" }}
            />
            <button
              className="btn btn-outline-light rounded-5 px-3"
              onClick={this.handleButtonClick}
              style={{ whiteSpace: "nowrap" }}
            >
              Set Rate
            </button>
          </div>
          <br />
          <br />
          <br />

          <div
            className="d-flex justify-content-center gap-3"
            style={{ maxWidth: "800px", margin: "auto" }}
          >
            <h4 className="pt-2">Withdraw For Admin:</h4>
            <input
              type="number"
              name="amount"
              onChange={this.handleAmountWithdraw}
              placeholder="Amount"
              required
              className="form-control rounded p-2"
              style={{ width: "auto" }}
            />
            <button
              className="btn btn-outline-light rounded-5 px-3"
              onClick={this.handleWithdrawSurplus}
              style={{ whiteSpace: "nowrap" }}
            >
              Withdraw Amount
            </button>
          </div>
          <br />
          <br />
          <br />

          <div
            className="d-flex justify-content-center gap-3"
            style={{ maxWidth: "800px", margin: "auto" }}
          >
            <h4 className="pt-2">Remove Expired Ads:</h4>
            <input
              type="number"
              name="adId"
              onChange={this.handleRemoveAd}
              placeholder="Ad Id"
              required
              className="form-control rounded p-2"
              style={{ width: "auto" }}
            />
            <button
              className="btn btn-outline-light rounded-5 px-3"
              onClick={this.handleRemoveAdButton}
              style={{ whiteSpace: "nowrap" }}
            >
              Remove Ad
            </button>
          </div>

          <br />
          <br />
          <br />

          <h3>Advertisemnt Display</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "10px",
            }}
          >
            {this.state.ads &&
              [...this.state.ads].reverse().map(
                (ad, index) =>
                  ad.name && (
                    <div
                      key={index}
                      style={{
                        border: "2px solid #fdfdfd",
                        borderRadius: "10px",
                        padding: "10px",
                      }}
                    >
                      <a
                        href={
                          ad.linkToTarget.startsWith("http://") ||
                          ad.linkToTarget.startsWith("https://")
                            ? ad.linkToTarget
                            : `http://${ad.linkToTarget}`
                        }
                      >
                        <img
                          src={ad.mediaFileLink}
                          alt="ad.mediaFileLink"
                          width="400"
                          height="400"
                        />
                      </a>
                      <p>ID : {ad.id}</p>
                      <p>Name : {ad.name}</p>
                      <p>Description : {ad.description}</p>
                      <p>Target : {ad.linkToTarget}</p>
                      <p>Impression Count : {ad.impressionsCount}</p>
                      <p>Impression Target : {ad.impressionsCountLimit}</p>
                      <p>Budget : {ad.budget} TRX</p>
                    </div>
                  )
              )}
          </div>
        </div>
      </div>
    );
  }
}

export default Admin;
