import Redis from 'ioredis';
import { SessionData } from '@/app/types';

export class RedisService {
  private static instance: RedisService;
  private redisClient: Redis;
  private isConnected: boolean = false;

  private constructor() {
    const redisUrl = process.env.REDIS_URL!;

    this.redisClient = new Redis(redisUrl, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
    });

    // Connection event handlers
    this.redisClient.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });

    this.redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
      this.isConnected = false;
    });

    this.redisClient.on('close', () => {
      console.log('Redis client disconnected');
      this.isConnected = false;
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  private async ensureConnection(): Promise<boolean> {
    if (!this.isConnected) {
      try {
        await this.redisClient.ping();
        this.isConnected = true;
      } catch (error) {
        console.error('Redis connection check failed:', error);
        return false;
      }
    }
    return true;
  }

  async getUserSessionData(
    userDbId: number,
    options: {
      includeQuizzes?: boolean,
      includeLiveClasses?: boolean
    } = {}
  ): Promise<SessionData> {
    const cacheKey = `user:sessions:${userDbId}`;

    try {
      // Check Redis connection before operations
      const isConnected = await this.ensureConnection();
      if (!isConnected) {
        return await this.fetchSessionDataFromMicroservices(userDbId, options);
      }

      // Try to get data from Redis
      const cachedData = await this.redisClient.get(cacheKey);

      if (cachedData) {
        try {
          return JSON.parse(cachedData);
        } catch (error) {
          console.error('Error parsing cached data:', error);
          // If parse fails, fetch fresh data
          return await this.fetchAndCacheSessionData(userDbId, options, cacheKey);
        }
      }

      return await this.fetchAndCacheSessionData(userDbId, options, cacheKey);
    } catch (error) {
      console.error('Error in getUserSessionData:', error);
      // Fallback to direct microservice calls if Redis fails
      return await this.fetchSessionDataFromMicroservices(userDbId, options);
    }
  }

  private async fetchAndCacheSessionData(
    userDbId: number,
    options: { includeQuizzes?: boolean, includeLiveClasses?: boolean },
    cacheKey: string
  ): Promise<SessionData> {
    const sessionData = await this.fetchSessionDataFromMicroservices(userDbId, options);

    // Only attempt to cache if we're connected
    if (this.isConnected) {
      try {
        await this.redisClient.set(
          cacheKey,
          JSON.stringify(sessionData),
          'EX',
          3600 // Cache for 1 hour
        );
      } catch (error) {
        console.error('Error caching session data:', error);
        // Continue even if caching fails
      }
    }

    return sessionData;
  }

  private async fetchSessionDataFromMicroservices(
    userDbId: number,
    options: {
      includeQuizzes?: boolean,
      includeLiveClasses?: boolean
    }
  ): Promise<SessionData> {
    try {
      const [sessionOccurrences, quizCompletionStatus] = await Promise.all([
        (options.includeLiveClasses || options.includeQuizzes)
          ? this.fetchSessionOccurrences(userDbId, options)
          : [],
        options.includeQuizzes
          ? this.fetchQuizCompletionStatus(userDbId)
          : {}
      ]);

      return {
        sessions: sessionOccurrences || [],
        quizCompletionStatus: quizCompletionStatus || {}
      };
    } catch (error) {
      console.error('Error fetching from microservices:', error);
      // Return empty data instead of throwing
      return {
        sessions: ["thullu"],
        quizCompletionStatus: {}
      };
    }
  }

  private async fetchSessionOccurrences(
    userDbId: number,
    options: {
      includeQuizzes?: boolean,
      includeLiveClasses?: boolean
    }
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        userDbId: userDbId.toString(),
        includeQuizzes: String(!!options.includeQuizzes),
        includeLiveClasses: String(!!options.includeLiveClasses)
      });

      const response = await fetch(`http://localhost:4000"/sessions?${params}`);
      console.log(response, "session")

      if (!response.ok) {
        console.error(`Session occurrences fetch failed with status: ${response.status}`);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching session occurrences:', error);
      return [];
    }
  }

  private async fetchQuizCompletionStatus(userDbId: number): Promise<Record<string, boolean>> {
    if (!process.env.NEXT_PUBLIC_QUIZ_BACKEND_URL) {
      console.error('Quiz backend URL not configured');
      return {};
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_QUIZ_BACKEND_URL}/user/${userDbId}/quiz-attempts`);

      if (response.status === 404) {
        // User has no quiz attempts yet, return empty object instead of throwing
        console.log(`No quiz attempts found for user ${userDbId}`);
        return {};
      }

      if (!response.ok) {
        console.error(`Quiz completion status fetch failed with status: ${response.status}`);
        return {};
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching quiz completion status:', error);
      return {};
    }
  }

  async close() {
    if (this.isConnected) {
      await this.redisClient.quit();
      this.isConnected = false;
    }
  }
}