const Queue = require('bull');
const { translate } = require('../utils/translate');
const { sendMessage } = require('../kafka/producer');

// Initialize the queue
const translateQueue = new Queue('translate-queue');

console.log(`Translate Worker ${process.pid} started`);

// Process tasks from the queue
translateQueue.process(async (job) => {
    const { text, imageName } = job.data;
    const start = Date.now();

    try {
        // console.log(`Translate Worker ${process.pid} started task for: ${imageName}`);
        
        // Perform translation
        const translatedText = await translate(text);

        // Send translated text to the next Kafka topic
        await sendMessage('pdf_topic', { translatedText, imageName });
    } catch (error) {
        console.error(`Translate Worker ${process.pid} encountered an error:`, error);
        throw error; // Let Bull handle retries if needed
    } finally {
        const duration = Date.now() - start; // Calculate processing time
        console.log(`Translate Filter processed message in ${duration}ms`);
    }
});
