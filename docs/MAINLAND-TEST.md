# Mainland test

Hosting stays outside mainland China, so no ICP filing is needed. But Vercel has no servers in the mainland and doesn't guarantee access there, so this test decides whether the site works for visitors on mainland networks. T2b runs it first, and T13 repeats it on the finished site.

## What to test

- **Networks:** China Telecom, China Unicom, and China Mobile. Mobile data and home broadband both count, so write down which one it was. Cover all three carriers.
- **No VPN:** no VPN, proxy, or "accelerator" app.
- **Days:** at least three different days, and once in the evening, when networks are busiest.
- **Page:** open `https://georgeluo.dev`. How many seconds until the headline and the dotted background show? Do the fonts and the photo show? The photo appears when you press "我长啥样" or "Show my face".
- **Chat:** open the AI twin ("问我的 AI 分身" or "Ask my AI twin") and send one short question. Does the reply appear word by word, all at once after a wait, or not at all? How many seconds until the first words?
- **Both pages:** most mainland visitors land on `/zh`, because `/` follows the browser's language. Try `/en` once too.

## Message for the tester

Chinese:

```text
麻烦帮我测一下我的个人网站在国内网络能不能正常打开。请先关掉 VPN，用手机流量或家里的宽带。

网址：https://georgeluo.dev ，请告诉我：
1. 能打开吗？大概几秒后能看到大标题和点阵背景？
2. 点“我长啥样”按钮，能看到一张黑白照片吗？
3. 点蓝色的“问我的 AI 分身”按钮，随便问一句（比如“你做过什么项目？”）。回答是一个字一个字出来的，还是等一会儿一下子全出来，还是没反应？大概几秒后开始出字？
4. 你用的是中国移动、联通还是电信？是手机流量还是家里宽带？在哪个省？现在的日期和时间是？

方便的话，换一天、晚上再测一次。有问题请截图发给我。

聊天框里输入的内容不会保存在我的网站上，但会发给 AI 服务来生成回答，所以请只问无关紧要的问题，不要输入个人信息。谢谢！
```

English:

```text
Could you test my website from mainland China? Please turn off any VPN, and use mobile data or your home broadband.

Open https://georgeluo.dev and tell me:
1. Does it open? Roughly how many seconds until you see the big headline and the dotted background?
2. Press the "Show my face" button (我长啥样). Does a black-and-white photo appear?
3. Press the blue "Ask my AI twin" button (问我的 AI 分身) and send one short question, for example "What have you built?". Does the answer appear word by word, all at once after a wait, or not at all? Roughly how many seconds until the first words?
4. Is it China Mobile, Unicom, or Telecom? Is it mobile data or home broadband? Which province are you in? What are the date and time?

If you can, repeat it on another day, once in the evening. Please screenshot any problem and send it to me.

What you type in the chat isn't saved by the site, but it is sent to an AI service to write the reply. So please ask something harmless and don't type personal details. Thank you!
```

## Results

Record the province, not a name or an address, because this repo is public.

| Date and time (China) | Carrier | Connection | Province | Page opens | Photo shows | Chat answers | Chat streams | Notes |
|---|---|---|---|---|---|---|---|---|
| 2026-11-07 00:01 | China Mobile | Mobile data | Guangdong | About 3 s | Yes, but slow to load | Within 1 s | Not reported | |
| 2026-11-07 00:01 | Not recorded | Home broadband, 100 Mbps | Guangdong | About 1 s | Yes | Not reported | Not reported | Same tester |
| 2026-11-07 07:00 | China Mobile | Mobile data | Guangdong | Works well | Not reported | About 1 s | Not reported | Same tester, in the morning |

The first tester also ran itdog (see below), and Chrome Lighthouse on a mainland mobile network: Performance 78 in the phone view and 80 in the desktop view. The phone run's biggest cost was the hero's koi animation, at about 14 seconds of script time on Lighthouse's slowed-down phone CPU.

### itdog, 2026-11-07

[itdog](https://www.itdog.cn) fetched `https://georgeluo.dev` from 324 probes on China Telecom, Unicom, and Mobile, plus Hong Kong, Macau, and Taiwan. It times the HTML document only, after the redirect to a language, not the fonts, scripts, photo, or chat.

| Check | Result |
|---|---|
| Reached the site | 316 of 324 (97.5%), with every province green on the map |
| Average time | 0.73 s overall: Telecom 0.84 s, Unicom 0.71 s, Mobile 0.71 s, Hong Kong, Macau, and Taiwan 0.39 s |
| Slowest | 4.85 s, Qinghai Telecom |
| Failures | 8 home-broadband probes (2 Telecom, 1 Unicom, 5 Mobile) connected and then timed out at 10 s. All 8 used one of Vercel's `.1` addresses, which served most other probes fine, so it isn't a block |
| Redirect | `/` to `/en` or `/zh` cost 0.3 to 1.5 s on slower probes, so shared links should point at `/zh` or `/en` directly |

## Verdict for T2b

Passed on 2026-11-07, by George's call: the site and the chat work on mainland networks without a VPN, so it stays on Vercel. Short of the bar below, the results so far come from one day, with no evening test, and the chat has only been tried on China Mobile. T13 repeats the test on the finished site and covers both gaps.

## Reading the results

Proposed by Claude. George decides.

- **Pass:** on all three carriers and on at least three days, the page is usable within about 5 seconds, the photo shows, and the chat's first words come within about 5 seconds and arrive gradually.
- **Slow:** the page takes 5 to 10 seconds, or the chat's reply arrives all at once. Find out what is slow first: DNS, the connection, the images, or the streaming.
- **Fail:** the page doesn't open on one carrier on any day, takes over 10 seconds, or the chat never answers. Then follow T2b's fallback order: a no-ICP option first, such as a static copy of the site on a host with better routing into China. Mainland hosting isn't planned.
