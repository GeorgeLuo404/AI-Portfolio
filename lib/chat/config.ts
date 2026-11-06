import "server-only";

// The chat's switches, read on the server. CHAT_ENABLED turns the AI twin on
// with "true"; anything else, or nothing, keeps it off. The page reads it
// while the site builds, so changing it takes a redeploy.

export const chatEnabled = () => process.env.CHAT_ENABLED === "true";

/** The DeepSeek model, so it can change without a code change. */
export const chatModel = () => process.env.DEEPSEEK_MODEL || "deepseek-flash";
