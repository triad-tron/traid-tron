module.exports = {
    //...
    resolve: {
      fallback: {
        crypto: require.resolve("crypto-browserify"),
        querystring: require.resolve("querystring-es3"),
        buffer: false,
        stream: false,
    },
},
}