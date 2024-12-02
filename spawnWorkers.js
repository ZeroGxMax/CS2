const { fork } = require('child_process');
const path = require('path');

// Number of workers to spawn
const NUM_OCR_WORKERS = 12;
const NUM_TRANSLATE_WORKERS = 1;
// const NUM_PDF_WORKERS = 1;

// Paths to worker scripts
const ocrWorkerPath = path.resolve(__dirname, './workers/ocrWorker.js');
const translateWorkerPath = path.resolve(__dirname, './workers/translateWorker.js');
const pdfWorkerPath = path.resolve(__dirname, './workers/pdfWorker.js');

// Function to spawn workers for a specific task
function spawnWorkers(numWorkers, workerPath, workerType) {
    for (let i = 0; i < numWorkers; i++) {
        const worker = fork(workerPath);

        worker.on('message', (msg) => {
            console.log(`[${workerType}] Worker ${worker.pid} says:`, msg);
        });

        worker.on('exit', (code) => {
            console.log(`[${workerType}] Worker ${worker.pid} exited with code ${code}`);
            if (code !== 0) {
                console.log(`Respawning [${workerType}] Worker...`);
                spawnWorkers(1, workerPath, workerType); // Restart the worker if it exits unexpectedly
            }
        });

        worker.on('error', (err) => {
            console.error(`[${workerType}] Worker ${worker.pid} encountered an error:`, err);
        });
    }
}

// Spawn OCR Workers
spawnWorkers(NUM_OCR_WORKERS, ocrWorkerPath, 'OCR');

// Spawn Translate Workers
spawnWorkers(NUM_TRANSLATE_WORKERS, translateWorkerPath, 'Translate');

// spawnWorkers(NUM_PDF_WORKERS, pdfWorkerPath, 'PDF');
