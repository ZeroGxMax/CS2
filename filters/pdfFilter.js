const { createPDF } = require("../utils/pdf");
const { NUMBER_OF_PDF_CONSUMER } = require("../constants/constants.js");

let pLimit; // Placeholder for dynamically imported `pLimit`

(async () => {
    const { default: pLimitDefault } = await import('p-limit'); // Dynamically import
    pLimit = pLimitDefault;
})();

async function pdfFilter({ translatedText, imageName }) {
    const start = Date.now();
    try {
        const limit = pLimit(NUMBER_OF_PDF_CONSUMER); // Initialize `pLimit` instance
        // const pdfFilePath = await limit(() => createPDF(translatedText, imageName)); 
        const pdfFilePath = createPDF(translatedText, imageName);
        // console.log("PDF Created at:", pdfFilePath);
        // console.log("Image name: ", imageName);
        return pdfFilePath;
    } catch (error) {
        console.error("PDF Filter Error:", error);
    } finally {
        const duration = Date.now() - start; // Calculate processing time
        // console.log(`PDF Filter processed message in ${duration}ms`);
    }
}

module.exports = pdfFilter;
