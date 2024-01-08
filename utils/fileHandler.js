const fs = require("fs");
const Path = require("path");
const util = require("util");
const fileOpened = util.promisify(fs.open);
const createFile = util.promisify(fs.mkdir);
const getBaseUrl = require("./../superadmin/utils/getBaseUrl");

async function fileHandler(dir, fileName) {
  const baseUrl = getBaseUrl();
  const path = Path.join(baseUrl, dir, fileName);
  console.log("*************path of file saved********************", path);

  fileOpened(path)
    .then((isFileExist) => {
      console.log("file is already created!", isFileExist);
      return true;
    })
    .catch((err) => {
      createFile(path)
        .then(() => true)
        .catch(() => false);
    });
}

fileHandler("images", "File");
