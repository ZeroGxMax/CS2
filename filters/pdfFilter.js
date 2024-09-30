const { createPDF } = require("../utils/pdf");

async function pdfFilter({ translatedText, imageName }) {
    try {
        const pdfFilePath = createPDF(translatedText, imageName);
        console.log("PDF Created at:", pdfFilePath);
        console.log("Image name: ", imageName)
        return pdfFilePath;
    } catch (error) {
        console.error("PDF Filter Error:", error);
    }
}

module.exports = pdfFilter;