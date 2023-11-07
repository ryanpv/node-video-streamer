# ExpressJS Video Streaming Server with AWS

This blog post discusses the architecture of my video streaming server that is built with ExpressJS. As the core architecture relies on some AWS services, I focus on how they were configured through the AWS console. The research phase for this topic was challenging for me because though there were many resources, most I came across were developed using different languages and libraries that had little support. However, I was able to put together the pieces by learning and understanding the concepts and technologies used. Therefore, this blog post will be a guide on this topic using Javascript. Additionally, many guides had skipped through some minor details of setting up the AWS services so I will try to go through the process step by step with each service I have integrated. Navigating back and forth between services will be necessary as the configurations are being completed. In the end I will also discuss some problems I faced during the development process.

## VIDEO FORMATTING

In this project, I use HTTP Live Streaming (HLS) protocol to serve videos to the client. This protocol splits the media files into separate shorter segments (“.ts” files) and creates a playlist/manifest (.m3u8) file. The manifest file describes the order, location, and other configurations of the media file, which are then sent to the client via HTTP. The “.ts” segments are retrieved from the same domain/resource path as the “.m3u8” file. It is far better performance to serve videos using this protocol compared to serving entire .mp4/.mov/etc files, which need to be completely downloaded before being able to play them. The segments are much smaller in size and are sent to the client via HTTP and allows the client to play the segments seamlessly. This is a much quicker method and provides better user experience.

In addition, I have implemented video upload functionality from the client, HLS format conversion, and then uploaded to AWS S3. Files are kept in memory in temp folders until they are uploaded to S3. After upload, the temp directories are deleted. The code to this is available to view in my Github: [ExpressJS/Node Video Streaming Server](https://github.com/ryanpv/node-video-streamer)

## ARCHITECTURE

### OVERVIEW:

The AWS services I am using to stream the videos are CloudFront, API Gateway, Lambda, and S3. To add some layers of protection for resources stored in S3, the bucket is configured to block all public access and restricting access through CloudFront signed URLs. Serving files through a CloudFront CDN enhances performance. CDNs optimize performance by reducing physical distance between the data and client. Data is served from the closest CDN cache location. Additionally, CDNs will use minification and file compression behind the scenes to improve the speeds for content delivery. The API Gateway and Lambda functions are used to fetch the manifest file and sign the “.ts” segments.

### IAM ROLE POLICIES:

I created a role in IAM services using the principle of least privilege to limit it to specific permissions. This should be implemented as much as possible with role-based access control (RBAC). The necessary permissions used for this project are:
1. AmazonS3ReadOnlyAccess
2. A custom permission policy to allow resources to assume this role and invoke Lambda functions:
     * Policy reference: https://docs.aws.amazon.com/apigateway/latest/developerguide/permissions.html
     * In the IAM console, using the link follow “API Gateway permissions model for invoking an API”.
First policy statement goes under the IAM role’s “Trust relationships” and the second goes under “Permission policies” in the “Permissions tab”. Trust relationships are necessary because they specify which resources can assume this role. The link above provides the trust policy JSON, but Lambda needs to be added to the list of services.

### S3 BUCKET SETUP:

Initial setup for the S3 bucket is simple. A single S3 bucket is used to store all “.m3u8” and “.ts” files. Upon creation, all settings are kept default other than the bucket name. Most important configuration is the “Block all public access” as it limits access to the stored S3 objects. This should also be the default configuration. To allow access to the S3 bucket, its policy must list the specific service(s) as well as the action(s). This project uses CloudFront to access S3, therefore it is included in the S3 policy statement. Fortunately, AWS makes adding the permissions policy easy by providing it automatically when we setup CloudFront. This will be discussed in more detail during the CloudFront setup.

An important note for this project specifically is that the S3 path parameters of where the “.ts” files are stored in MUST match the path parameters of our API gateway. This necessity is due to the behaviour of the HLS protocol. It retrieves the “.ts” file segments by using the same request URL but replaces the only “.m3u8” file name path parameter with the “.ts” segment file name. For example, the request URL may look something like “https://1a2b3.CloudFront.net/lambda_test/requestedFile.m3u8”. When it’s time for the “.ts” file to be fetched, it will replace the “.m3u8” parameter in the request URL, which would look like “https://1a2b3.CloudFront.net/lambda_test/requestedFileSegment.ts” instead. To successfully retrieve all “.ts” files, this project is configured to store all objects in a folder “/lambda_test” to match the API gateway path that is used.

### API GATEWAY SETUP PART 1:

To build the API Gateway, I selected the “REST API” type. AWS states that although this may potentially increase cost compared to the “HTTP API”, which is limited in services, the REST API option can provide better flexibility with integrated services. After selecting the “API type”, I configured it as a “New API” and opted for “Edge-optimized” for the “API endpoint type”. On top of using a CloudFront CDN, this will enhance the performance and scalability for this project.

After the API build process completed, I created a stage named “tester”, which can be done by navigating to the “Stages” section on the side panel of the console. Stages can be named anything, but the appropriate naming convention should really be a reference the current stage of the project, such as “production” or “development”.

Next, I created a resource by navigating to the “Resources” section on the side panel. Resource names in API gateway are just the URI parameters, hence “resource”. Since I was also testing out how to integrate Lambda with API gateway, I set up a resource named “lambda_test” and then added another resource under it but selected the “Proxy resource” option. The proxy option allows us to use the resource like a dynamic route. If you are familiar with Express APIs, you will notice that the endpoint params are similar. In Express a dynamic route would look like “/lambda_test/:proxy”, but in API gateway it looks like “/lambda_test/{proxy+}”. The proxy param is used to fetch the different media file requests.

Before integrating Lambda with the API, a method needs to be attached to the resource. To create a method, navigate to the specific resource and click on the “Create method” button. There are multiple “Integration type” options, but since we are using Lambda functions I selected “Lambda Proxy” with a GET “Method type”. The settings can be modified anytime so at this time the “Lambda function” input can be left blank. Once a method is created, it will show up under that specific resource. After completing the setup, the API must be deployed, which is done by using the “Deploy API” button. Select the stage that is currently in use, such as development/production. However, in my case, I stuck with my “tester” stage. Whenever any changes are made to the API under the “Resources” section, the API must be redeployed for the changes to take effect.

This concludes the first part of the API gateway setup. We will return to the “Integration request” configuration after setting up the Lambda function.

### LAMBDA FUNCTION SETUP:

The main purpose of the Lambda function will be to fetch “.m3u8” files and sign the “.ts” segments in the “.m3u8” file before returning it to the client. To create the Lambda function, I chose “Author from scratch” with a “Node.js 18x” “Runtime” configuration. With the IAM role already created, it can be selected under the “Change default execution role” drop down.

![HLS-Lambda-Function](https://github.com/ryanpv/node-video-streamer/blob/main/public/HLS-Lambda-Func.png)

The picture above is a screenshot of the Lambda function. To store the private keys, users can use AWS SSM or Secrets Manager. To break down the business logic a bit further:

1. Using the AWS SDK, a GET request will be sent to S3 to retrieve the “.m3u8” playlist/manifest file. The file has a multiline format so the “transformToString()” method from the SDK will return as a multiline string.
2. Using the returned response, each line is separated into its own string and looped through to find the “.ts” segments for signing with the CloudFront URL.
     * Depending on how API gateway resources are set up, the resource name/param must be included in the “url” property value when being signed with “getSignedUrl()”.
3. After the signature is completed, all query params such as “Signature”, “Key-Pair-Id”, and “Expires”, should be split from the signed URL and appended to the “.ts” segment in the “.m3u8 file replacing the old segments.
4. Once replacing the old segments with the signed ones are complete, ensure formatting of the modified “.m3u8” file matches the old one. (Same number of lines/spaces/etc).
     * The initial splitting of the lines will include an additional line at the end that is an empty string. This* must be removed for the playlist to work.
5. Return the modified “.m3u8” as the response body.

Typically, CloudFront sends an event object with the request/response data accessible by “event.Resource[0].cf”. However, the integration of API gateway as an origin will change this formatting. For Lambda to be able to send a successful response, it will have to use the same formatting.
    * See link for proper response format: https://docs.aws. amazon.com/lambda/latest/dg/services-apigateway.html#apigateway-example-event