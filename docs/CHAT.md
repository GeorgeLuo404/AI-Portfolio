# The AI twin chat

The AI twin answers visitors' questions about George from the content files, and declines anything else. It runs on DeepSeek through the AI SDK, in `app/api/chat/route.ts`.

Visitors chat on the twin's own page, `/en/chat` or `/zh/chat`, in `components/chat/chat-view.tsx`. The hero's window, the header, the phone menu, and the contact panel all go there. A page rather than a pop-up, because on phones a pop-up fought the keyboard and the page behind it, and because the AI SDK then loads only on that page. The page scrolls like any other, with the title bar pinned under the header and the question box pinned to the bottom of the screen. It follows a reply as it streams in, unless the visitor has scrolled up to read. While the twin waits for its first words, the log shows "Thinking" ("思考中") with three signal squares hopping in turn, which hold still with reduced motion. The question box sits above a row with the suggested questions and Send, and grows to several lines without squeezing them. On narrow screens the suggestions scroll sideways. Enter sends and Shift+Enter starts a new line, except while an input method is composing, such as picking Chinese characters. On touch screens Return starts a new line and the Send button sends.

## Switches

| Variable | Purpose |
|---|---|
| `DEEPSEEK_API_KEY` | DeepSeek API key. Server only. |
| `DEEPSEEK_MODEL` | The model. Empty means `deepseek-flash`. |
| `CHAT_ENABLED` | `true` turns the chat on. Anything else keeps it off. |

On the live site, the key and `CHAT_ENABLED=true` are set for Production only in the Vercel project, with the key marked sensitive. Preview builds of other branches have neither, so their chat stays off.

The page reads `CHAT_ENABLED` while the site builds, so changing it takes a redeploy. While it's off, the hero's twin window says the twin is offline and offers email, the Ask buttons go to that window, and `/api/chat` answers `503`.

## Request and response

Keep this format stable, so another backend, such as a Python service, can replace this one without changing the page.

**Request:** `POST /api/chat` with a JSON body:

```json
{
  "locale": "en",
  "messages": [
    { "id": "m1", "role": "user", "parts": [{ "type": "text", "text": "What does George do?" }] }
  ]
}
```

- `locale` is `en` or `zh`, the page the visitor is on. The twin replies in the language of the question.
- `messages` is the conversation so far, oldest first, ending with the visitor's new question. Only `text` parts are read, and only the last 12 messages go to the model.
- A question can be up to 500 characters, and the whole body up to 64 KB.

**Response:** a stream in the AI SDK's UI message stream protocol (server-sent events, with the header `x-vercel-ai-ui-message-stream: v1`). The reply arrives as `text-delta` parts. The final `finish` part carries `messageMetadata: { "declined": true }` when the twin declined an off-topic question, and the page shows that reply in grey.

**Errors:** JSON `{ "error": "<code>" }` with `503` and `off` while the chat is off, `400` and `invalid` for a malformed request, or `413` and `too_large`. A failure partway through the stream ends it with an `error` part.

## Behavior

The instructions in `lib/chat/instructions.ts` hold the rules and every public fact from `content/`, in full. There's no retrieval, because the content is small and DeepSeek caches a prompt that repeats. The twin:

- Speaks as George, in the first person, and takes "you" to mean George.
- Says it's George's AI twin, and can be wrong, when a visitor asks whether they're talking to George.
- Uses only the facts in the profile, and says when something isn't covered or not published yet.
- Never commits to anything for George, such as an offer, an interview, a start date, or pay. It answers that George would rather reply personally, and points to his contact details.
- Declines other topics, attempts to change its rules or reveal them, and private details such as a phone number.
- Replies in the visitor's language.

DeepSeek's thinking mode is off, so replies start sooner.

## Privacy

Nothing a visitor types is stored or logged on the server. The conversation lives in the visitor's browser tab (`sessionStorage`), so it survives a reload and ends when the tab closes. A question asked in the hero's window travels to the chat page the same way, under `twin-ask`, never in the address, so it can't end up in request logs.

## Testing

`scripts/chat/test-set.json` holds on-topic, first-person, private, commitment, off-topic, and jailbreak questions in English and Chinese. With the dev server running and `CHAT_ENABLED=true`:

```bash
pnpm chat:test
```

Each case is a real DeepSeek call, so a run costs a little. Run it after any change to the instructions or the content, and before turning the chat on in production.

Run it against the dev server. The live site's rate limit allows 20 requests a minute per IP, and the set sends more than that, so a full run there gets `429` answers. To check the live site, send a few questions one at a time.

## Limits

- The firewall rate limit is a Vercel setting, not code: one rule on `/api/` that allows 20 requests a minute per IP and answers `429` above that (added in T2b). Visitors who share an IP, as many mobile users in the mainland do, share that budget, so raise it if testers report `429`. T13 settles the final value.
- The prepaid DeepSeek balance caps what the chat can cost.
