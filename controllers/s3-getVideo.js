const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/cloudfront-signer");

const getVideo = async (req, res) => {
  console.log("reached getVideo: ", req.url)
  const client = new S3Client({});
  const fetcher = new GetObjectCommand({
    Bucket: "rv-videos-bucket",
    Key: "user1_rain.mp4.m3u8"
  });

  const response = await client.send(fetcher);

  // const streamData = await response.Body.pipe(createWriteStream("tester")); // streams file contents to a file named "tester" (used to test txt/plain file)

  const sendHLS = await response.Body.transformToString(); // reads requested file contents and returns as string

  const manifestArr = sendHLS.split("\n")

  const newArr = manifestArr.map(el => {
    if (el.includes('.ts')) {
      const signer = getSignedUrl({
        url: "https://d1hiuuwq8197zo.cloudfront.net/lambda_test/" + el,
        dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24),
        privateKey: process.env.CLOUDFRONT_PRIVATE_KEY,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
      }); 

      const signature = signer.split("https://d1hiuuwq8197zo.cloudfront.net/lambda_test/")[1];

      console.log("ts file: ", el)
      return el.replace(el, signature) + "\n"
    }
    return el + "\n"
  });

  newArr.pop()
  const updatedManifestFile = newArr.join("")

  res.writeHead(206, { "Access-Control-Allow-Origin": "*" });

  // res.send(sendHLS); // cant be used with res.writeHead()
  // res.end(sendHLS);
  res.end(updatedManifestFile)
}

module.exports = getVideo