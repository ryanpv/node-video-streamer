const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

const s3SignedUrl = async (req, res) => {
  const item = getSignedUrl({
    url: "https://d2yxw8mz314xgc.cloudfront.net/testFile.txt",
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
  });

  console.log("result", item)
  res.send(item)
};

module.exports = s3SignedUrl