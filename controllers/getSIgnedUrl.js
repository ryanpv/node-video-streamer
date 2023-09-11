const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

const s3SignedUrl = async (req, res) => {
  const item = getSignedUrl({
    url: "https://d2yxw8mz314xgc.cloudfront.net/user1_rain.mp4.m3u8",
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    // region: "us-east-1"
  });

  console.log("result", item)
  res.send({ cloudfrontUrl: item })
};

module.exports = s3SignedUrl