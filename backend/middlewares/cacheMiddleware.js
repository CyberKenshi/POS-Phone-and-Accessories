const client = require('../config/redisClient');

const cacheMiddleware = (keyGenerator, ttl = 3600) => async (req, res, next) => {
    try {
        const cacheKey = keyGenerator(req);
        if (!cacheKey) {
            return next(new Error('Cache key is not valid.'));
        }

        if (!client.isOpen) {
            console.error('Redis client is closed. Cannot fetch from cache.');
            return next(new Error('Redis client is closed.'));
        }

        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({
                code: 200,
                success: true,
                message: 'Data fetched successfully (from cache)',
                result: JSON.parse(cachedData)
            });
        }
        // Ghi đè res của controllers
        const originalJson = res.json.bind(res);
        res.json = async (data) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                if (data && data.result && typeof data.result === 'object') {
                    await client.set(cacheKey, JSON.stringify(data.result), 'EX', ttl);
                }
            }
            originalJson(data);
        };
        next();
    } catch (error) {
        console.error('Redis Cache Error:', error);
        return next(error);
    }
};

module.exports = cacheMiddleware;
