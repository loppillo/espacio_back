export declare class CacheService {
    private cache;
    private readonly DEFAULT_TTL;
    get<T>(key: string): T | null;
    set<T>(key: string, data: T, ttl?: number): void;
    invalidate(key: string): void;
    invalidatePattern(pattern: string): void;
    clear(): void;
    cleanup(): void;
    getStats(): {
        size: number;
        keys: string[];
    };
}
