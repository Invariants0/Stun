import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

const keyGenerator = (req: Request): string => { 
    return req.user?.uid || req.ip || "unknown";
}

export const aiRateLimiter = rateLimit({ 
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each user to 10 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator,
    message: {error:"Too many requests from this user, please try again after a minute."},
})

export const presenceRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // limit each user to 60 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator,
    message: {error:"Too many presence updates from this user, please try again after a minute."},
})

export const boardUpdateRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // limit each user to 30 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    keyGenerator,
    message: {error:"Too many board updates from this user, please try again after a minute."},
})