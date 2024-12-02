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
    const start = Date.now();
    try {
        const limit = pLimit(NUMBER_OF_TRANS_CONSUMER); // Initialize the concurrency limit
        const translatedText = await limit(() => translate(text));
        // const translatedText = translate(text);
        await sendMessage('pdf_topic', { translatedText, imageName });
    } catch (error) {
        console.error("Translate Filter Error:", error);
    } finally {
        const duration = Date.now() - start; // Calculate processing time
        // console.log(`Translate Filter processed message in ${duration}ms`);
    }
}

module.exports = translateFilter;
