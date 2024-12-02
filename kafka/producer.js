const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new Producer(client);
const {NUMBER_OF_CONSUMER_INSTANCES} = require("../constants/constants.js")


producer.on('ready', () => {
    console.log("Kafka Producer is connected and ready.");
});

producer.on('error', (err) => {
    console.error("Kafka Producer error:", err);
});

let partitionCounter = 0;

function sendMessage(topic, message) {
    return new Promise((resolve, reject) => {
        const partition = partitionCounter % 10;
        partitionCounter++;
        // console.log("Partition: " + partition)
        const payloads = [{ topic, messages: JSON.stringify(message), partition: partition}];
        producer.send(payloads, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

module.exports = {
    sendMessage
};