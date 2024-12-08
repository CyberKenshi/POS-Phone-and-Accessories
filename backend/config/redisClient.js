const redis = require('redis');

const client = redis.createClient({
    url: 'redis://redis:6379' // Thay đổi từ 'localhost' thành 'redis'
});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    await client.connect();
})();

module.exports = client;