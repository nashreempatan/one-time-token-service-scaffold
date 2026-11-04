import "dotenv/config";
import crypto from "node:crypto";
import Redis from "ioredis";
// Connect Node.js to Redis
const redis = new Redis(process.env.REDIS_URL);
// Create Redis key
const keyFor = (id) => "token:" + id;
// ISSUE TOKEN
export async function issueToken(payload, ttlSeconds) {
if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
throw new Error("TTL must be a positive integer");
}
const value = JSON.stringify(payload);
if (value === undefined) {
throw new Error("Payload must be JSON serializable");
}
// Generate a secure random token
while (true) {
const tokenId = crypto.randomBytes(16).toString("hex");
// Store token and expiry atomically
const result = await redis.set(
keyFor(tokenId),
value,
"EX",
ttlSeconds,
"NX"
);
if (result === "OK") {
console.log("Token issued successfully!");
return tokenId;
}
}
}
// CONSUME TOKEN
export async function consumeToken(tokenId) {
// GETDEL reads and deletes atomically
const value = await redis.getdel(keyFor(tokenId));
if (value === null) {
return {
ok: false,
reason: "invalid"
};
}
return {
ok: true,
payload: JSON.parse(value)
};

}
// Close Redis connection after testing
export async function closeTokenService() {
await redis.quit();
}