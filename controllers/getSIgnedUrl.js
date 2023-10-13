const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");
const url = require("url");


const s3SignedUrl = async (req, res) => {
  const item = getSignedUrl({
    // url: "https://d2yxw8mz314xgc.cloudfront.net/user1_rain.mp4.m3u8",
    // url: "https://d1hiuuwq8197zo.cloudfront.net/lambda_test?media-request=user1_rain.mp4.m3u8",
    url:"https://d1hiuuwq8197zo.cloudfront.net/lambda_test/user1_train-kyoto-1440p.mp4.m3u8",
    // url: "https://d1hiuuwq8197zo.cloudfront.net/lambda_test/user1_rain.mp4.m3u8", // URI for test distro and .m3u8 path pattern
    dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
    privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
    keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
    // region: "us-east-1"
  });

  const urlQueryParams = url.parse(item, true).query

  const newUrl = `${ item }&Expires-PREFIX=${ urlQueryParams.Expires }&Key-Pair-Id-PREFIX=${ urlQueryParams['Key-Pair-Id'] }&Signature-PREFIX=${ urlQueryParams.Signature }`

  console.log("RESULT", item)
  // console.log("NEW URL: ", newUrl)
  console.log("PARSED url: ", url.parse(newUrl, true).query) // returns separation of query params
  res.send({ cloudfrontUrl: item })
};

module.exports = s3SignedUrl