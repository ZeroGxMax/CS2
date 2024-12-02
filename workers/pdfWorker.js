const Queue = require('bull');
const { createPDF } = require('../utils/pdf');

// Initialize the PDF task queue
const pdfQueue = new Queue('pdf-queue');

console.log(`PDF Worker ${process.pid} started`);

// Process tasks from the queue
pdfQueue.process(async (job) => {
    const { translatedText, imageName } = job.data;
    const start = Date.now();

    try {
        // console.log(`PDF Worker ${process.pid} received task for ${imageName}`);
        
        // Create PDF
        const pdfFilePath = createPDF(translatedText, imageName);
        
        // Notify completion
        return { pdfFilePath };
    } catch (error) {
        console.error(`PDF Worker ${process.pid} encountered an error for ${imageName}:`, error);
        throw error; // Let Bull handle retries
    } finally {
        const duration = Date.now() - start; // Calculate processing time
        console.log(`PDF Filter processed message in ${duration}ms`);
    }
});

// pdfQueue.on('completed', (job, result) => {
//     console.log(`PDF Worker ${process.pid} successfully completed job ${job.id}:`, result);
// });

// pdfQueue.on('failed', (job, err) => {
//     console.error(`PDF Worker ${process.pid} failed job ${job.id}. Error:`, err.message);
// });

// process.on('exit', (code) => {
//     console.log(`PDF Worker ${process.pid} exiting with code ${code}`);
// });
