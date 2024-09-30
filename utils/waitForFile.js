const fs = require('fs');

function waitForFile(filePath, timeout = 300000) {
    return new Promise((resolve, reject) => {
        const interval = 2;
        const endTime = Date.now() + timeout;

        const checkFile = setInterval(() => {
            if (fs.existsSync(filePath)) {
                clearInterval(checkFile);
                resolve(filePath);
            } else if (Date.now() > endTime) {
                clearInterval(checkFile);
                reject(new Error("File not found within the timeout period"));
            }
        }, interval);
    });
}

module.exports = {
    waitForFile
}