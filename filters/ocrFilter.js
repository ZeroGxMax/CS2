const ocr = require("../utils/ocr");
const { sendMessage } = require("../kafka/producer.js");
const { NUMBER_OF_OCR_CONSUMER } = require("../constants/constants.js");

let pLimit; // Declare variable to hold the imported module

(async () => {
    const { default: pLimitDefault } = await import('p-limit'); // Dynamically import
    pLimit = pLimitDefault;
})();

async function ocrFilter({ imagePath, imageName }) {
    try {
        const limit = pLimit(NUMBER_OF_OCR_CONSUMER); // Initialize `pLimit` instance
        const text = await limit(() => ocr.image2text(imagePath)); // Concurrency control
        await sendMessage('translate_topic', { text, imageName });
    } catch (error) {
        console.error("OCR Filter Error:", error);
    }
}

module.exports = ocrFilter;
