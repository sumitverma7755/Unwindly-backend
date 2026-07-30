import Redis from 'ioredis';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

// In-Memory Fallback Map for slot locks when Redis is not running locally
const memoryStore = new Map<string, { value: string; expiresAt: number }>();

try {
  const client = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy: () => null // Don't retry continuously if offline
  });

  client.on('error', () => {
    if (isRedisAvailable) {
      console.warn('Redis connection lost. Switching to in-memory fallback.');
      isRedisAvailable = false;
    }
  });

  client.connect().then(() => {
    redisClient = client;
    isRedisAvailable = true;
    console.log('Connected to Redis server.');
  }).catch(() => {
    console.log('Redis not detected locally. Operating in zero-dependency in-memory mode.');
  });
} catch (err) {
  console.log('Operating in zero-dependency in-memory mode.');
}

export const acquireSlotLock = async (key: string, value: string, ttlSeconds: number): Promise<boolean> => {
  if (redisClient && isRedisAvailable) {
    try {
      const res = await redisClient.set(key, value, 'EX', ttlSeconds, 'NX');
      return res === 'OK';
    } catch {
      // Fallback if call fails
    }
  }
  
  // In-memory fallback lock logic
  const now = Date.now();
  const existing = memoryStore.get(key);
  if (existing && existing.expiresAt > now) {
    return false; // Lock already taken
  }
  memoryStore.set(key, { value, expiresAt: now + ttlSeconds * 1000 });
  return true; // Lock acquired
};

export const releaseSlotLock = async (key: string): Promise<void> => {
  if (redisClient && isRedisAvailable) {
    try {
      await redisClient.del(key);
      return;
    } catch {
      // Fallback
    }
  }
  memoryStore.delete(key);
};
