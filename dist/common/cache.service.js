"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
let CacheService = class CacheService {
    constructor() {
        this.cache = new Map();
        this.DEFAULT_TTL = 5 * 60 * 1000;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        const now = Date.now();
        const isExpired = now - entry.timestamp > entry.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }
        return entry.data;
    }
    set(key, data, ttl) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.DEFAULT_TTL,
        });
    }
    invalidate(key) {
        this.cache.delete(key);
    }
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }
    clear() {
        this.cache.clear();
    }
    cleanup() {
        const now = Date.now();
        const keysToDelete = [];
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }
    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
        };
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = __decorate([
    (0, common_1.Injectable)()
], CacheService);
//# sourceMappingURL=cache.service.js.map