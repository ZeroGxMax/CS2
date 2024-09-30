const ocr = require("../utils/ocr")
const {sendMessage} = require("../kafka/producer.js")

async function ocrFilter({imagePath, imageName}) {
    try {
        const text = await ocr.image2text(imagePath);
        console.log("OCR result: ", text);
        await sendMessage('translate_topic', { text, imageName });
    } catch (error) {
        console.error("OCR Filter Error:", error);
    }
}

module.exports = ocrFilter;