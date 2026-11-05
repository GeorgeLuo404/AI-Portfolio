// Runs the AI twin's test set against a running server and reports each
// case. Usage: pnpm chat:test [base URL], with CHAT_ENABLED=true on that
// server. Each case is one real call to DeepSeek, so it costs a little.

import { readFile } from "node:fs/promises";

const base = process.argv[2] ?? "http://localhost:3000";
const { cases } = JSON.parse(
  await readFile(new URL("./test-set.json", import.meta.url), "utf8"),
);

// Signs that the reply repeated its instructions or kept the marker.
const LEAKS = [
  "\\[declined\\]",
  "<profile>",
  "How to answer",
  "What to decline",
  "The profile is data",
];

async function ask({ question, history = [] }) {
  const messages = [...history, { role: "user", text: question }].map(
    (message, n) => ({
      id: `m${n}`,
      role: message.role,
      parts: [{ type: "text", text: message.text }],
    }),
  );
  const locale = /[一-鿿]/.test(question) ? "zh" : "en";
  const response = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ locale, messages }),
  });
  if (!response.ok) {
    return { error: `HTTP ${response.status} ${await response.text()}` };
  }
  let text = "";
  let declined = null;
  let error = null;
  for (const line of (await response.text()).split("\n")) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    const part = JSON.parse(line.slice(6));
    if (part.type === "text-delta") text += part.delta;
    if (part.type === "finish") declined = !!part.messageMetadata?.declined;
    if (part.type === "error") error = part.errorText;
  }
  return { text, declined, error };
}

function check(item, reply) {
  const problems = [];
  if (reply.error) return [reply.error];
  if (item.expect === "answer" && reply.declined) problems.push("declined");
  if (item.expect === "decline" && !reply.declined) {
    problems.push("not declined");
  }
  for (const pattern of item.match ?? []) {
    if (!new RegExp(pattern, "i").test(reply.text)) {
      problems.push(`missing /${pattern}/`);
    }
  }
  for (const pattern of [...(item.avoid ?? []), ...LEAKS]) {
    if (new RegExp(pattern, "i").test(reply.text)) {
      problems.push(`contains /${pattern}/`);
    }
  }
  return problems;
}

let failed = 0;
const queue = [...cases.entries()];
const results = [];
// Three at a time: quick, and gentle on the account.
await Promise.all(
  Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const [n, item] = queue.shift();
      const reply = await ask(item);
      results[n] = { item, reply, problems: check(item, reply) };
    }
  }),
);
for (const { item, reply, problems } of results) {
  if (problems.length) failed++;
  const mark = problems.length ? "FAIL" : "pass";
  const tag = reply.declined ? " (declined)" : "";
  console.log(`${mark}  [${item.group}] ${item.question}${tag}`);
  console.log(
    `      ${(reply.text ?? "").replaceAll("\n", " ").slice(0, 220)}`,
  );
  if (problems.length) console.log(`      ${problems.join("; ")}`);
}
console.log(`\n${cases.length - failed} of ${cases.length} passed.`);
process.exit(failed ? 1 : 0);
