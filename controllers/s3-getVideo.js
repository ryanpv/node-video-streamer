const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { createWriteStream } = require("fs")

const getVideo = async (req, res) => {
  console.log("reached getVideo: ", req.url)
  const client = new S3Client({});
  const fetcher = new GetObjectCommand({
    Bucket: "rv-videos-bucket",
    Key: "user1_rain.mp4.m3u8"
  });

  const response = await client.send(fetcher);
  // await response.Body.pipe(createWriteStream("tester"));
  const sendHLS = await response.Body;
  res.writeHead(206, { "Access-Control-Allow-Origin": "*" });
  console.log(await response.Body);

  res.send(sendHLS);
  // res.end();
}

module.exports = getVideo