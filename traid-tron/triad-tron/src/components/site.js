import React from "react";
import TronLinkGuide from "./TronLinkGuide";
import TronWeb from "tronweb";
import Utils from "../utils";

// import Content from './Content';

import "./App/App.css";

const FOUNDATION_ADDRESS = "TWiWt5SEDzaEqS6kE5gandWMNfxR2B5xzg";
const PUBLISHER_ID = 0;

class Site extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ads: [],
      adId: 0,
      random: [],
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
    setTimeout(() => {
      this.getRandomAd();
    }, 4000);
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

  incrementImpressionsCount = async (adId, publisherId) => {
    await Utils.contract
      .incrementImpressionsCount(adId, publisherId)
      .send({
        feeLimit: 100000000,
        callValue: 0,
        shouldPollResponse: true,
      });
  }

  getRandomAd = async () => {
    const { ads } = this.state;
    if (ads.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * ads.length);
    const randomAd = ads[randomIndex];
    this.setState({ random: [randomAd] });
    console.log("Random Ad", randomAd);
    await this.incrementImpressionsCount(randomAd.id, PUBLISHER_ID);
}

  render() {
    if (!this.state.tronWeb.installed) return <TronLinkGuide />;

    if (!this.state.tronWeb.loggedIn) return <TronLinkGuide installed />;

    // Check if this.random has elements before accessing index
    const randomAd = this.state.random.length > 0 ? this.state.random[0] : null;

    return (
      <div className="row">
        {randomAd && (
          <div className="col-lg-2 text-center" style={{ marginTop: '200px' }}>
            <div style={{ position: "fixed", height: "100%" }}>
            <a
              href={
                randomAd.linkToTarget.startsWith("http://") ||
                randomAd.linkToTarget.startsWith("https://")
                  ? randomAd.linkToTarget
                  : `http://${randomAd.linkToTarget}`
              }
            >
              <img
                src={randomAd.mediaFileLink}
                alt={randomAd.name}
                width="200"
                height="200"
              />
            </a>
            <h2>{randomAd.name}</h2>
            <p>{randomAd.description}</p>
          </div>
          </div>
        )}
        <div className="col-lg-8 text-center">
          <h1 style={{ color: "white" }}>Best Laptops To Buy In 2024</h1>
          <p className="sub-text">
            Looking for one of the best laptops of 2024? You've arrived at
            exactly the right place as here at Laptop Mag we test dozens of
            laptops every year to find the best of the best. We already have
            some new arrivals to our list released this year with plenty of
            additional exciting laptops on the horizon with talk of AI PC, the
            intriguing Qualcomm Snapdragon X Elite chipset, and more on the
            horizon. But rest assured we have plenty of outstanding options for
            you right now. Whether you are on the search for an affordable
            Chromebook, a powerful gaming laptop, a flexible 2-in-1 laptop, or a
            content creation laptop with a gorgeous display, our extensive
            reviews and testing at Laptop Mag will guide you to your perfect
            laptop.
          </p>
          <img src="https://cdn.mos.cms.futurecdn.net/oS7CEyVTZx3Re3eCRkV33W-1200-80.jpg.webp" width="500" height="300"></img>
          <p className="sub-text">
            Looking for one of the best laptops of 2024? You've arrived at
            exactly the right place as here at Laptop Mag we test dozens of
            laptops every year to find the best of the best. We already have
            some new arrivals to our list released this year with plenty of
            additional exciting laptops on the horizon with talk of AI PC, the
            intriguing Qualcomm Snapdragon X Elite chipset, and more on the
            horizon. But rest assured we have plenty of outstanding options for
            you right now. Whether you are on the search for an affordable
            Chromebook, a powerful gaming laptop, a flexible 2-in-1 laptop, or a
            content creation laptop with a gorgeous display, our extensive
            reviews and testing at Laptop Mag will guide you to your perfect
            laptop.
          </p>
          <img src="https://cdn.mos.cms.futurecdn.net/oS7CEyVTZx3Re3eCRkV33W-1200-80.jpg.webp" width="500" height="300"></img>
          <p className="sub-text">
            Looking for one of the best laptops of 2024? You've arrived at
            exactly the right place as here at Laptop Mag we test dozens of
            laptops every year to find the best of the best. We already have
            some new arrivals to our list released this year with plenty of
            additional exciting laptops on the horizon with talk of AI PC, the
            intriguing Qualcomm Snapdragon X Elite chipset, and more on the
            horizon. But rest assured we have plenty of outstanding options for
            you right now. Whether you are on the search for an affordable
            Chromebook, a powerful gaming laptop, a flexible 2-in-1 laptop, or a
            content creation laptop with a gorgeous display, our extensive
            reviews and testing at Laptop Mag will guide you to your perfect
            laptop.
          </p>
        </div>
        
        {randomAd && (
          <div className="col-lg-2 text-center" style={{ marginTop: '200px' }}>
            <div style={{ position: "fixed", height: "100%" }}>
            <a
              href={
                randomAd.linkToTarget.startsWith("http://") ||
                randomAd.linkToTarget.startsWith("https://")
                  ? randomAd.linkToTarget
                  : `http://${randomAd.linkToTarget}`
              }
            >
              <img
                src={randomAd.mediaFileLink}
                alt={randomAd.name}
                width="200"
                height="200"
              />
            </a>
            <h2>{randomAd.name}</h2>
            <p>{randomAd.description}</p>
          </div>
          </div>
        )}
      </div>
    );
  }
}

export default Site;
