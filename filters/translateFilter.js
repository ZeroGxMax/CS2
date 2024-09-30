const { translate } = require("../utils/translate");
const { sendMessage } = require("../kafka/producer");

async function translateFilter({ text, imageName }) {
    try {
        const translatedText = await translate(text);
        console.log("Translated Text:", translatedText);

        await sendMessage('pdf_topic', { translatedText, imageName });
    } catch (error) {
        console.error("Translate Filter Error:", error);
    }
}

module.exports = translateFilter;