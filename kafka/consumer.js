const kafka = require('kafka-node');
const ConsumerGroup = kafka.ConsumerGroup;
const ocrFilter = require("../filters/ocrFilter");
const translateFilter = require("../filters/translateFilter");
const pdfFilter = require("../filters/pdfFilter");
const EventEmitter = require('events');

const eventEmitter = new EventEmitter();

function consumeMessages(instanceId = 0, topic) {
    // const topics = [
    //     'ocr_topic',  // Specific partition of ocr_topic
    //     'translate_topic',                     // Entire topic
    //     'pdf_topic'                            // Entire topic
    // ];
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

    const consumerGroup = new ConsumerGroup(consumerGroupOptions, [topic]);
    // console.log(consumerGroup);

    console.log(`Consumer instance ${instanceId} on ${topic} is running...`);

    consumerGroup.on('message', async (message) => {
        if (isFirstMessage && topic == 'ocr_topic') {
            isFirstMessage = false; // Prevent further logging
            eventEmitter.emit('firstMessage'); // Notify when the first message is consumed
        }
        console.log(message)
        try {
            // console.log(message)
            const parsedMessage = JSON.parse(message.value);

            switch (message.topic) {
                case 'ocr_topic':
                    await ocrFilter(parsedMessage);
                    break;
                case 'translate_topic':
                    await translateFilter(parsedMessage);
                    break;
                case 'pdf_topic':
                    await pdfFilter(parsedMessage);
                    break;
            }
        } catch (err) {
            console.error("Error processing message:", err);
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
