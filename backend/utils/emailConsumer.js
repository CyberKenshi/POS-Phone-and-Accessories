const { getChannelAndQueue } = require('../config/rabbitmq');
const sendEmail = require('./sendEmail');

const emailConsumer = async () => {
    try {
        const { channel, queue } = getChannelAndQueue();

        if (!channel) {
            throw new Error('RabbitMQ channel not initialized.');
        }

        await channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const emailData = JSON.parse(msg.content.toString());
                //console.log('Received email data from queue:', emailData);

                try {
                    await sendEmail(
                        emailData.to,
                        emailData.subject,
                        emailData.text,
                        emailData.htmlContent,
                        emailData.attachmentPath
                    );

                    console.log('Email sent successfully');
                    channel.ack(msg);
                } catch (error) {
                    console.error('Failed to send email:', error);

                }
            }
        });

        console.log('Email consumer started and listening to queue');
    } catch (error) {
        console.error('Error starting email consumer:', error);
    }
};

module.exports = emailConsumer;
