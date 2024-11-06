import React from "react";
import TronLinkGuide from "./TronLinkGuide";
import TronWeb from "tronweb";
import Utils from "../utils";

// import Content from './Content';

import "./App/App.css";

const FOUNDATION_ADDRESS = "TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg";

class Advertiser extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ads: [],
      ratePerImpression: 0,
      adId: 0,
      amount: 0,
      loading: false,
      adForm: {
        name: "",
        description: "",
        mediaFileLink: "",
        linkToTarget: "",
        impressionsCountLimit: 0,
        budget: 0,
      },

      tronWeb: {
        installed: false,
        loggedIn: false,
      },
    };
  }

  handleInputChange = (event) => {
    this.setState({
      adForm: {
        ...this.state.adForm,
        [event.target.name]: event.target.value,
      },
    });
  };

  handleSubmit = async (event) => {
    event.preventDefault();
    const {
      name,
      description,
      mediaFileLink,
      linkToTarget,
      impressionsCountLimit,
      budget,
    } = this.state.adForm;
    const intBudget = parseInt(budget);
    const convertedBudget = intBudget * 1000000;
    const newImpressionsCountLimit = parseInt(impressionsCountLimit);

    // Call the smart contract function to create an ad
    await Utils.contract
      .createAd(
        name,
        description,
        mediaFileLink,
        linkToTarget,
        newImpressionsCountLimit,
        0,
        convertedBudget
      )
      .send({
        feeLimit: 100000000,
        callValue: convertedBudget,
        shouldPollResponse: true,
      });

    // Fetch the updated data
    this.fetchData();
    alert("Ad created successfully");
  };

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

  handleInputChange = (event) => {
    const { name, value } = event.target;
    let newBudget = this.state.adForm.budget;

    if (name === "impressionsCountLimit") {
      // Calculate the new budget based on the rate per impression and the impression count limit
      const newImpressionsCountLimit = parseInt(value);
      const ratePerImpression = this.state.ratePerImpression;
      newBudget = 2 * ratePerImpression * newImpressionsCountLimit;
    }

    // Update the adForm state, including the budget
    this.setState((prevState) => ({
      adForm: {
        ...prevState.adForm,
        [name]: value,
        budget: newBudget,
      },
    }));
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
            Advertiser Dashboard
          </h1>
          <br />
          <div
            className="d-flex justify-content-center flex-column align-items-center gap-3"
            style={{ maxWidth: "800px", margin: "auto" }}
          >
            <form onSubmit={this.handleSubmit}>
              <h2 className="pt-2">Create Ad</h2>
              <div className="row gap-3">
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="name"
                      onChange={this.handleInputChange}
                      placeholder="Name"
                      required
                      className="form-control rounded p-2"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="description"
                      onChange={this.handleInputChange}
                      placeholder="Description"
                      required
                      className="form-control rounded p-2"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="linkToTarget"
                      onChange={this.handleInputChange}
                      placeholder="Link to Target"
                      required
                      className="form-control rounded p-2"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="mediaFileLink"
                      onChange={this.handleInputChange}
                      placeholder="Media File Link"
                      required
                      className="form-control rounded p-2"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="number"
                      name="impressionsCountLimit"
                      onChange={this.handleInputChange}
                      placeholder="Impressions Count Limit"
                      required
                      className="form-control rounded p-2"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="number"
                      name="budget"
                      value={this.state.adForm.budget}
                      placeholder="Budget"
                      required
                      className="form-control rounded p-2"
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              </div>

              <button
                className="btn btn-outline-light rounded-5 px-5 mt-3"
                type="submit"
                style={{ whiteSpace: "nowrap" }}
              >
                Create Ad
              </button>
            </form>
          </div>
          <br />
          <br />
          <h4>Current Rate Per Impression: {this.state.ratePerImpression}</h4>
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

export default Advertiser;
