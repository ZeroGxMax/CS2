const Queue = require('bull');
const tesseract = require('node-tesseract-ocr');
const { sendMessage } = require('../kafka/producer.js');

// Initialize the Bull queue
const ocrQueue = new Queue('ocr-queue');
console.log(`OCR Worker ${process.pid} started`);

// Process tasks from the queue
ocrQueue.process(async (job) => {
    const { imagePath, imageName } = job.data;
    const start = Date.now();

    try {
        // console.log(`Processing OCR for ${imageName}`);
        const text = await tesseract.recognize(imagePath, { lang: 'eng' });
        await sendMessage('translate_topic', { text, imageName });
        // console.log(`OCR completed for ${imageName}`);
    } catch (error) {
        console.error(`Error in OCR processing for ${imageName}:`, error);
    } finally {
        const duration = Date.now() - start; // Calculate processing time
        console.log(`OCR Filter processed message in ${duration}ms`);
    }
});
