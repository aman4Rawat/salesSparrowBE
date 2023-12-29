const fs = require("fs");

const deleteImageHandler = (image) => {
    if (!image) return;
    if (fs.existsSync(`images/${image.split("images/")[1]}`)) {
        fs.unlink(`images/${image.split("images/")[1]}`, (err) => {
            if (err) return console.log("Error in deleting image!");
            console.log("Image deleted successfully.");
        });
    }
}

module.exports = deleteImageHandler;