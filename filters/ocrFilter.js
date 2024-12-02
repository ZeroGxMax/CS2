const ocr = require("../utils/ocr");
const { sendMessage } = require("../kafka/producer.js");
const { NUMBER_OF_OCR_CONSUMER } = require("../constants/constants.js");
const tesseract = require("node-tesseract-ocr")

let pLimit; // Declare variable to hold the imported module

(async () => {
    const { default: pLimitDefault } = await import('p-limit'); // Dynamically import
    pLimit = pLimitDefault;
})();

async function ocrFilter({ imagePath, imageName }) {
    const start = Date.now();
    try {
        const limit = pLimit(NUMBER_OF_OCR_CONSUMER); // Initialize `pLimit` instance
        // const text = ocr.image2text(imagePath)
        // const text = await limit(() => ocr.image2text(imagePath)); // Concurrency control
        const text = await tesseract.recognize(imagePath, {
            lang: "eng"
        })
        await sendMessage('translate_topic', { text, imageName });
    } catch (error) {
        console.error("OCR Filter Error:", error);
    } finally {
        const duration = Date.now() - start; // Calculate processing time
        console.log(`OCR Filter processed message in ${duration}ms`);
    }
}

module.exports = ocrFilter;
