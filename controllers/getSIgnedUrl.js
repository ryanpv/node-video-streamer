const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

const s3SignedUrl = async (req, res) => {
  const item = getSignedUrl({
    // url:"https://d1hiuuwq8197zo.cloudfront.net/lambda_test/user1_train-kyoto-1440p.mp4.m3u8",
    // url:"https://d1hiuuwq8197zo.cloudfront.net/lambda_test/testUser_rain.mp4.m3u8",
    url:"https://d1hiuuwq8197zo.cloudfront.net/lambda_test/testUser_river-japan-1440p.mp4.m3u8",
    // dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    // region: "us-east-1"
  });

  res.send({ cloudfrontUrl: item })
};

module.exports = s3SignedUrl