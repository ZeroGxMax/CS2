const { translate } = require("../utils/translate");
const { sendMessage } = require("../kafka/producer");
const { NUMBER_OF_TRANS_CONSUMER } = require("../constants/constants.js");

let pLimit; // Placeholder for dynamically imported `pLimit`

// Dynamically import `p-limit`
(async () => {
    const { default: pLimitDefault } = await import('p-limit');
    pLimit = pLimitDefault; // Assign imported `pLimit` to the variable
})();

async function translateFilter({ text, imageName }) {
    try {
        const limit = pLimit(NUMBER_OF_TRANS_CONSUMER); // Initialize the concurrency limit
        const translatedText = await limit(() => translate(text)); // Concurrency control
        await sendMessage('pdf_topic', { translatedText, imageName });
    } catch (error) {
        console.error("Translate Filter Error:", error);
    }
}

module.exports = translateFilter;
