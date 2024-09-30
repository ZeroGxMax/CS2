const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new Producer(client);

producer.on('ready', () => {
    console.log("Kafka Producer is connected and ready.");
});

producer.on('error', (err) => {
    console.error("Kafka Producer error:", err);
});

function sendMessage(topic, message) {
    return new Promise((resolve, reject) => {
        const payloads = [{ topic, messages: JSON.stringify(message) }];
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