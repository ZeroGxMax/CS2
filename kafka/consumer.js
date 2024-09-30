const kafka = require('kafka-node');
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const ocrFilter = require("../filters/ocrFilter");
const translateFilter = require("../filters/translateFilter");
const pdfFilter = require("../filters/pdfFilter");
const async = require('async');
const {NUMBER_OF_ASYNC} = require("../constants/constants")

// const queue = async.queue(async (task, callback) => {
//     try {
//         await task();
//     } catch (error) {
//         console.error("Error processing task:", error);
//     }
//     callback();
// }, NUMBER_OF_ASYNC);


function consumeMessages(instanceId=0) {
    const topics = [
        { topic: 'ocr_topic' },
        { topic: 'translate_topic' },
        { topic: 'pdf_topic' }
    ];
    const consumerOptions = {
        groupId: 'ocr_consumer_group',
        autoCommit: true
    };
    const consumer = new Consumer(client, topics, consumerOptions);

    console.log(`Consumer instance ${instanceId} is running...`);

    // console.log("Hello")

    consumer.on('message', async (message) => {
        
        const parsedMessage = JSON.parse(message.value);

        switch (message.topic) {
            case 'ocr_topic':
                // queue.push(async () => {
                //     await ocrFilter(parsedMessage);
                //     console.log(`Processed OCR message for instance ${instanceId}`);
                // });
                await ocrFilter(parsedMessage);
                break;
            case 'translate_topic':
                // queue.push(async () => {
                //     await translateFilter(parsedMessage);
                //     console.log(`Processed translate message for instance ${instanceId}`);
                // });
                await translateFilter(parsedMessage);
                break;
            case 'pdf_topic':
                // queue.push(async () => {
                //     const pdfFilePath = await pdfFilter(parsedMessage);
                //     console.log(`Processed PDF message for instance ${instanceId}, output path: ${pdfFilePath}`);
                // });
                await pdfFilter(parsedMessage);
                break;
        }
    });

    consumer.on('error', (err) => {
        console.error("Kafka Consumer error:", err);
    });
}

// consumeMessages()

module.exports = {
    consumeMessages
};