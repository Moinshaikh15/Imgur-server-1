const express = require("express");
const fs = require("fs");
const { createReadStream } = require("fs");
const FormData = require("form-data");
const fetch = require("node-fetch");
const https = require("https");

let router = express.Router();

router.post("/", async (req, res) => {
  let url = req.body.url;
  let fileType = req.body.fileType;
  let fileName = req.body.fileName;

  
  // Image will be stored at this path
  let dirname = __dirname.split("Routes").join("");
  const paths = `${dirname}/public/${fileName}`;
  //download the attachment in server
  https.get(url, async (result) => {
    const filePath = fs.createWriteStream(paths);
    result.pipe(filePath);
    filePath.on("finish", async () => {
      filePath.close(); //download completed

      //read the downloaded file
      const videoStream = createReadStream(paths);

      //create form data
      let formData = new FormData();
      formData.append("image", videoStream, { filename: fileName });

      let requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${process.env.CLIENT_ID}`,
          Accept: "*/*",
        },
        body: formData,
      };

      //upload to Imgur
      await fetch("https://api.imgur.com/3/upload", requestOptions)
        .then((response) => response.json())
        .then(async (result) => {
          console.log("successfully uploaded");
          res.status(200).json(result.data);
        })
        .catch((error) => {
          res.status(400).send(error);
        });
    });
  });

});

module.exports = router;
