import {
    issueToken,
    consumeToken,
    closeTokenService
} from "./token-service.js";

try {
    // Step 1: Create a token
    const id = await issueToken(
        { userId: 42, purpose: "password-reset" },
        60
    );

    console.log("Generated token:", id);
    console.log("Token length:", id.length);

    // Step 2: Consume the token once
    const firstResult = await consumeToken(id);
    console.log("First consumption:", firstResult);

    // Step 3: Try consuming it again
    const secondResult = await consumeToken(id);
    console.log("Second consumption:", secondResult);

    // Step 4: Create another token for concurrency test
    const concurrentId = await issueToken(
        { userId: 100, purpose: "email-verification" },
        60
    );

    // Step 5: Five users consume the SAME token simultaneously
    const results = await Promise.all([
        consumeToken(concurrentId),
        consumeToken(concurrentId),
        consumeToken(concurrentId),
        consumeToken(concurrentId),
        consumeToken(concurrentId)
    ]);

    // Step 6: Count successful consumers
    const winners = results.filter(result => result.ok).length;

    console.log("Concurrent results:", results);
    console.log("Number of winners:", winners);

    // Step 7: Verify single-use property
    if (winners === 1) {
        console.log("SUCCESS: Token was consumed exactly once!");
    } else {
        throw new Error("Single-use test failed!");
    }

} catch (error) {
    console.error("Test failed:", error);
    process.exitCode = 1;

} finally {
    await closeTokenService();
}