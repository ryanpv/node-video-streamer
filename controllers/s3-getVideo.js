const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { createWriteStream } = require("fs")

const getVideo = async (req, res) => {
  console.log("reached getVideo: ", req.url)
  const client = new S3Client({});
  const fetcher = new GetObjectCommand({
    Bucket: "rv-videos-bucket",
    Key: "user1_rain.mp4.m3u8"
    // Key: "testFile.txt"
  });

  const response = await client.send(fetcher);

  // const streamData = await response.Body.pipe(createWriteStream("tester")); // streams file contents to a file named "tester" (used to test txt/plain file)

  const sendHLS = await response.Body.transformToString(); // reads requested file contents and returns as string
  console.log("hls return: ", sendHLS)
  res.writeHead(206, { "Access-Control-Allow-Origin": "*" });

  // res.send(sendHLS); // cant be used with res.writeHead()
  res.end(sendHLS);
}

module.exports = getVideo