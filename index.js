const ocr = require("./utils/ocr");
const { createPDF } = require("./utils/pdf");
const { translate } = require("./utils/translate");
const path = require('path');
const multer = require("multer")
const express = require("express")
const {ocrFilter} = require("./filters/ocrFilter")
const {sendMessage} = require("./kafka/producer")
const {consumeMessages, eventEmitter} = require("./kafka/consumer.js")
const {waitForFile} = require("./utils/waitForFile")
const archiver = require('archiver');
const fs = require("fs");
const {NUMBER_OF_CONSUMER_INSTANCES, NUMBER_OF_OCR_CONSUMER, NUMBER_OF_PDF_CONSUMER, NUMBER_OF_TRANS_CONSUMER} = require("./constants/constants")

const app = express();

const PORT = 3000;

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
})

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true)
        } else {
            cb(new Error('Chỉ chấp nhận hình ảnh với định dạng JPEG, JPG, hoặc PNG'));
        }
    }
})

app.post("/upload", upload.array("images"), async (req, res) => {
    
    if (!req.files || req.files.length == 0) {
        return res.status(400).json({
            "error": "No file uploaded"
        })
    }

    const pdfFilePaths = [];
    const consumers = [];
    
    try {
        
        let file, imagePath, imageName;
        const promises = req.files.map((file) => {
            const imagePath = path.join(__dirname, 'uploads', file.filename);
            const imageName = path.basename(file.filename, path.extname(file.filename));
        
            // Send message concurrently
            return sendMessage('ocr_topic', { imagePath, imageName });
        });
        
        try {
            // Wait for all messages to be sent
            await Promise.all(promises);
            console.log('All files processed and messages sent to ocr_topic.');
        } catch (error) {
            console.error('Error sending messages:', error);
        }

        for (let i = 0; i < NUMBER_OF_CONSUMER_INSTANCES; i++) {
            const consumer = consumeMessages(i);
            consumers.push(consumer);
        }
        
        // for (let i = 0; i < NUMBER_OF_OCR_CONSUMER; i++) {
        //     const consumer = consumeMessages(i, 'ocr_topic');
        //     consumers.push(consumer);
        // }
        // for (let i = 0; i < NUMBER_OF_TRANS_CONSUMER; i++) {
        //     const consumer = consumeMessages(i, 'translate_topic');
        //     consumers.push(consumer);
        // }
        // for (let i = 0; i < NUMBER_OF_PDF_CONSUMER; i++) {
        //     const consumer = consumeMessages(i, 'pdf_topic');
        //     consumers.push(consumer);
        // }
        let startTime;
        eventEmitter.once('firstMessage', () => {
            startTime = new Date();
            console.log(`Start Time: ${startTime}`);
        });

        for (let i = 0; i < req.files.length; i++) {
            file = req.files.at(i)
            imageName = path.basename(file.filename, path.extname(file.filename));
            const pdfFilePath = path.join(__dirname, 'output', `${imageName}.pdf`);

            await waitForFile(pdfFilePath);

            if (req.files.length == 1) {
                // console.timeEnd("TotalProcessingTime");
                res.download(pdfFilePath, `${imageName}.pdf`, (err) => {
                    if (err) {
                        console.error("Error downloading the PDF file:", err);
                        res.status(500).json({ error: "An error occurred while downloading the PDF file." });
                    }
                }) 
                return;
            } else {
                pdfFilePaths.push({ path: pdfFilePath, name: `${imageName}.pdf` });
            }
        }
        
        const endTime = new Date();
        console.log(`End Time: ${endTime}`);
        var time_consuming = (endTime - startTime) / 1000;
        console.log(`Time consumed: ${time_consuming.toFixed(2)} seconds`);

        // await Promise.all(consumers.map((consumer) => consumer.close()));
        const zipFilePath = path.join(__dirname, 'output', 'all_pdfs.zip');
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            console.log(`ZIP file created: ${zipFilePath}, size: ${archive.pointer()} bytes`);
            

            res.download(zipFilePath, 'all_pdfs.zip', (err) => {
                if (err) {
                    console.error("Error downloading the ZIP file:", err);
                    res.status(500).json({ error: "An error occurred while downloading the ZIP file." });
                }
            });
        });

        archive.on('error', (err) => {
            throw err;
        });

        archive.pipe(output);

        for (const file of pdfFilePaths) {
            archive.file(file.path, { name: file.name });
        }

        await archive.finalize();
            
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "An error occurred while processing the image." });
    }    
})


app.get("/", (req, res) => {
    res.render("index.html")
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
