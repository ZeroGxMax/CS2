const kafka = require('kafka-node');
const ConsumerGroup = kafka.ConsumerGroup;
const ocrFilter = require("../filters/ocrFilter");
const translateFilter = require("../filters/translateFilter");
const pdfFilter = require("../filters/pdfFilter");
const EventEmitter = require('events');
const Queue = require('bull');

const eventEmitter = new EventEmitter();
const ocrQueue = new Queue('ocr-queue');
const translateQueue = new Queue('translate-queue');
const pdfQueue = new Queue('pdf-queue');

function consumeMessages(instanceId = 0) {
    const topics = [
        'ocr_topic',
        'translate_topic',                     // Entire topic
        'pdf_topic'                            // Entire topic
    ];
    const consumerGroupOptions = {
        kafkaHost: 'localhost:9092', // Kafka broker address
        // groupId: `${topic}_ocr_consumer_group_2`, // Consumer group ID
        groupId: `ocr_consumer_group_1`, // Consumer group ID
        autoCommit: true, // Automatically commit offsets
        fromOffset: 'latest', // Start from the latest offset
        sessionTimeout: 15000, // Session timeout for consumers
        protocol: ['roundrobin'], // Partition assignment strategy
    };

    let isFirstMessage = true;

    const consumerGroup = new ConsumerGroup(consumerGroupOptions, topics);
    // console.log(consumerGroup);

    console.log(`Consumer instance ${instanceId} is running...`);

    consumerGroup.on('message', async (message) => {
        if (isFirstMessage) {
            isFirstMessage = false; // Prevent further logging
            eventEmitter.emit('firstMessage'); // Notify when the first message is consumed
        }
        // consumerGroup.pause();

        try {
            // console.log(message)
            const parsedMessage = JSON.parse(message.value);

            switch (message.topic) {
                case 'ocr_topic':
                    await ocrQueue.add(parsedMessage);
                    break;
                case 'translate_topic':
                    await translateQueue.add(parsedMessage);
                    break;
                case 'pdf_topic':
                    // pdfFilter(parsedMessage)
                    await pdfQueue.add(parsedMessage);
                    break;
            }
        } catch (err) {
            console.error("Error processing message:", err);
        } finally {
            // consumerGroup.resume(); // Resume fetching new messages
        }
    });

    consumerGroup.on('error', (err) => {
        console.error("Kafka ConsumerGroup error:", err);
    });
    return consumerGroup;
}

// Uncomment the line below to run the consumer directly
// consumeMessages();

module.exports = {
    consumeMessages,
    eventEmitter
};
