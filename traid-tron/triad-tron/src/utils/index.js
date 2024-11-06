const contractAddress = 'TXerGCTtXRqaPTD1BmuYPf9yHpd2ahyrqs'

const utils = {
    tronWeb: false,
    contract: false,

    async setTronWeb(tronWeb) {
        this.tronWeb = tronWeb;
        this.contract = await tronWeb.contract().at(contractAddress)
    },

};

export default utils;

