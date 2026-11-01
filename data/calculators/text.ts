import type { CalculatorConfig } from './types.ts';

export const textCalculators: CalculatorConfig[] = [
  // Custom-component stub: rendered by a special component in page.tsx.
  {
    id: 'character-counter',
    category: 'text',
    glyph: 'Aa',
    updatedAt: '2026-10-21',
    aliases: ['letter counter', 'text length calculator', 'twitter character counter', 'character count tool', 'word counter'],
    related: ['hashtag-counter', 'instagram-engagement-calculator', 'youtube-earnings-calculator'],
    redirectFrom: ['word-counter'],
    title: 'Character Counter',
    description: 'Count characters, words, sentences, and paragraphs, and check your text against platform limits confirmed from official docs for X (Twitter), Instagram, LinkedIn, YouTube, and SMS.',
    example: 'A 137-character sample fits X, Instagram, LinkedIn, YouTube\'s description field, and a standard GSM-7 SMS — but it is already 37 characters over YouTube\'s 100-character title limit and 67 over a 70-character emoji/non-Latin SMS segment.',
    inputs: [],
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'Why platform character limits differ, and where these numbers come from',
        paragraphs: [
          'Every count on this page — characters, words, sentences, paragraphs, lines — is plain text analysis: no platform is contacted, nothing is uploaded, and the same text gives the same counts whether you are drafting a tweet or an essay. The platform limits below are a different kind of number: each one is set by that platform and documented in its own developer or help documentation, not a universal web standard, which is why they vary so much from 100 characters (a YouTube title) to 5,000 (a YouTube description).',
          'SMS is a special case worth understanding on its own. A single text message segment holds 160 characters, but only when every character fits the GSM 7-bit default alphabet defined by the mobile messaging standard (3GPP/ETSI TS 123.038) — basically unaccented Latin letters, digits and common punctuation. The moment a message includes one emoji, or a character from a non-Latin script such as Chinese, Arabic or Cyrillic, the whole message switches to 16-bit UCS-2 encoding, which drops the limit to 70 characters per segment because each character now takes twice the space.',
          'A platform limit that could not be confirmed from an official source is left off this page entirely rather than guessed — Facebook\'s often-quoted 63,206-character post limit, for instance, does not appear in any current Meta Help Center or developer document, and Google\'s own Search Central documentation explicitly states there is no fixed character limit for a meta description (truncation depends on pixel width, not a character count), so neither is presented here as a hard limit.'
        ]
      },
      howTo: {
        intro: 'Type or paste your text into the box.',
        steps: [
          { name: 'Enter your text', text: 'Type directly or paste from anywhere — a draft post, an essay, an email.' },
          { name: 'Read the counts', text: 'Characters, characters without spaces, words, sentences, paragraphs and lines all update as you type.' },
          { name: 'Check platform limits', text: 'Each bar shows your character count against a confirmed official limit, turning red if you go over.' },
          { name: 'Check the reading time', text: 'A rough estimate at 200 words per minute, a commonly used average for silent reading of online text.' },
          { name: 'Switch to the hashtag counter', text: 'Use the mode toggle to switch to counting and extracting hashtags instead.' }
        ],
        outro: 'Everything runs in your browser as you type. Nothing is uploaded, sent, or stored.'
      },
      formula: {
        intro: 'Each count is a simple, well-defined rule applied to the text you enter.',
        expression:
          'characters = length of the text, spaces included\nwords = the text split on runs of whitespace\nsentences = the number of . ! or ? runs\nparagraphs = the text split on blank lines',
        terms: [
          { symbol: 'words', meaning: 'Counted by splitting on whitespace, so "well-known" is one word and multiple spaces between words do not create extra ones.' },
          { symbol: 'sentences', meaning: 'Counted by runs of sentence-ending punctuation (., !, ?), including a run like "?!" as a single sentence end — an approximation, not true grammatical parsing.' },
          { symbol: 'paragraphs', meaning: 'Counted by blank lines, so a single line break alone does not start a new paragraph.' }
        ],
        note: 'Platform limits come from each platform\'s own documentation (see references) and may change — always check the live counter on the platform itself before publishing anything close to a limit.'
      },
      workedExample: {
        intro: 'A short two-paragraph sample: "Daily Calculations helps you plan budgets, track fitness, and convert units. Try it today!" followed by a blank line and "It\'s free and works entirely in your browser."',
        rows: [
          { label: 'Characters (with spaces)', value: '137' },
          { label: 'Characters (no spaces)', value: '115' },
          { label: 'Words', value: '22' },
          { label: 'Sentences', value: '3' },
          { label: 'Paragraphs', value: '2' },
          { label: 'Reading time (22 words ÷ 200/min)', value: '7 seconds' }
        ],
        result: '137 characters · 22 words · fits most limits, but over on a YouTube title and a non-GSM-7 SMS',
        explanation: 'At 137 characters, this text fits within X\'s 280, Instagram\'s 2,200, LinkedIn\'s 3,000, YouTube\'s 5,000-character description, and a standard 160-character GSM-7 SMS — but it is 37 characters over YouTube\'s 100-character title limit, and 67 over the 70-character limit a single emoji would trigger by forcing UCS-2 encoding.'
      },
      watchOut: [
        { title: 'A single emoji can shrink an SMS by more than half', body: 'Adding one emoji or non-Latin character to an otherwise plain-text message switches the whole message from the 160-character GSM-7 alphabet to 70-character UCS-2 encoding — not just for that one character, but for the entire message.' },
        { title: 'Sentence counting is approximate', body: 'Counting runs of . ! and ? misses sentences that do not end in standard punctuation and can over- or under-count abbreviations ("Dr. Smith") or ellipses ("wait...") compared to true grammatical sentence parsing.' },
        { title: 'Platform limits change over time', body: 'Platforms have raised limits before (X\'s standard limit was 140 characters before becoming 280) and can do so again. Treat the figures here as current as of the last review date, not permanent.' },
        { title: 'A character limit is not the same as what is actually visible', body: 'Instagram shows roughly the first 125 characters of a caption before a "more" link, well short of its 2,200-character maximum; a LinkedIn post folds after roughly 140-210 characters depending on device, long before its 3,000-character cap.' },
        { title: 'Unconfirmed limits are left out, not guessed', body: 'Facebook\'s commonly cited 63,206-character post limit is not documented in any current official Meta source found, and Google explicitly sets no fixed character limit for a meta description — neither appears as a hard limit on this page.' }
      ],
      references: [
        { label: 'X (Twitter) Developer Platform, Counting characters', url: 'https://docs.x.com/fundamentals/counting-characters' },
        { label: 'Meta for Developers, Instagram Platform — IG User Media (caption parameter)', url: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/' },
        { label: 'LinkedIn Help, Post and Share Updates', url: 'https://www.linkedin.com/help/linkedin/answer/a528176' },
        { label: 'YouTube Help, Edit Video Settings', url: 'https://support.google.com/youtube/answer/57404' },
        { label: 'Twilio, How Long Can a Text Message Be? (SMS character limits)', url: 'https://www.twilio.com/docs/glossary/what-sms-character-limit' },
        { label: 'Google Search Central, How to Write Meta Descriptions', url: 'https://developers.google.com/search/docs/appearance/snippet' }
      ]
    },
    seo: {
      title: 'Character Counter – Words, Sentences, Confirmed Platform Limits',
      description: 'Count characters, words, sentences, and paragraphs, and check platform limits confirmed from official docs: X (Twitter) 280, Instagram 2,200, LinkedIn 3,000, YouTube, and SMS GSM-7/UCS-2.',
      faq: [
        { question: 'What is the X (Twitter) character limit?', answer: 'X\'s own developer documentation states a 280-character limit for standard posts. URLs are automatically wrapped with a t.co link that always counts as 23 characters, regardless of the original URL\'s length.' },
        { question: 'What is the Instagram caption limit?', answer: 'Meta\'s official Instagram Platform documentation sets a maximum of 2,200 characters, 30 hashtags, and 20 @ tags per caption, the same ceiling for images, videos, and reels. Only roughly the first 125 characters show before the "more" cutoff in feed.' },
        { question: 'What is the LinkedIn post character limit?', answer: 'LinkedIn\'s own Help Center states posts can contain up to 3,000 characters.' },
        { question: 'What are YouTube\'s title and description limits?', answer: 'YouTube\'s Help Center states a 100-character limit for video titles and a 5,000-character limit for descriptions.' },
        { question: 'How many characters fit in a text message?', answer: 'A single SMS segment holds 160 characters using the GSM 7-bit alphabet (plain Latin text), per the mobile messaging standard and confirmed in Twilio\'s SMS documentation. Including an emoji or a non-Latin character switches the whole message to UCS-2 encoding, which lowers the limit to 70 characters.' },
        { question: 'What is the Facebook post character limit?', answer: 'A figure of 63,206 is widely quoted online, but it does not appear in any current official Meta documentation found, so it is not shown as a confirmed limit on this page.' },
        { question: 'Is there an official character limit for a meta description?', answer: 'No. Google\'s own Search Central documentation states there is no fixed character limit — the displayed snippet is truncated based on pixel width on the results page, not a character count — so this page does not show one as a hard limit either.' },
        { question: 'How is reading time calculated?', answer: 'Reading time is estimated at 200 words per minute, a commonly used average for silent reading of online text, and is shown as a rough guide rather than a precise prediction for any individual reader.' }
      ]
    },
    compute() { return {}; }
  },
  // Custom-component stub: rendered by a special component in page.tsx.
  {
    id: 'hashtag-counter',
    category: 'text',
    glyph: '#',
    updatedAt: '2026-10-21',
    aliases: ['hashtag limit checker', 'instagram hashtag counter', 'tag counter'],
    related: ['character-counter', 'instagram-engagement-calculator', 'youtube-earnings-calculator'],
    title: 'Hashtag Counter',
    description: 'Count and extract unique hashtags from your caption or post, and check Instagram\'s official 30-hashtag limit.',
    example: 'A caption with "#sale #sale #newcollection #shoplocal #fashion" has 4 unique hashtags (the repeated #sale counts once), well within Instagram\'s 30-hashtag limit.',
    inputs: [],
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'How hashtags are counted, and what the 30-hashtag limit actually is',
        paragraphs: [
          'A hashtag is detected here as a "#" immediately followed by one or more letters, digits or underscores — the same basic pattern every major platform uses. Repeating the same hashtag in one caption does not count it twice: this tool, like Instagram\'s own enforcement, counts unique hashtags.',
          'Instagram is the one platform in this comparison with an official, documented hashtag-count limit: Meta\'s own Instagram Platform API reference states a caption may contain a maximum of 2,200 characters, 30 hashtags, and 20 @ tags, applied the same way to image, video and reel captions. Posting through the app enforces the same 30-hashtag ceiling, and exceeding it is rejected rather than silently truncated.',
          'Other major platforms — X, LinkedIn, Facebook, TikTok — support hashtags but do not publish a separate numeric hashtag-count limit the way Instagram does; a hashtag on those platforms simply counts toward the post\'s overall character limit like any other text. Hashtags have no effect at all on purely private messaging apps such as WhatsApp or Messenger, since there is no public feed or search for them to connect to.'
        ]
      },
      howTo: {
        intro: 'Paste your caption or post text, hashtags included, into the box.',
        steps: [
          { name: 'Paste your text', text: 'Include the hashtags exactly as you plan to post them.' },
          { name: 'Read the unique hashtag count', text: 'Repeated hashtags in the same caption count once, matching how Instagram evaluates a caption.' },
          { name: 'Check the Instagram limit', text: 'A clear pass/fail message shows whether you are within the documented 30-hashtag limit.' },
          { name: 'Review the extracted list', text: 'Every unique hashtag found is listed below, useful for a final check before posting.' },
          { name: 'Switch to the character counter', text: 'Use the mode toggle if you also want the full character/word/sentence breakdown.' }
        ],
        outro: 'Everything runs in your browser as you type. Nothing is uploaded, sent, or stored.'
      },
      formula: {
        intro: 'Hashtags are found by pattern, then deduplicated.',
        expression: 'hashtags = every match of "#" followed by letters, digits, or underscores\nuniqueHashtags = the distinct values among those matches',
        terms: [
          { symbol: 'uniqueHashtags', meaning: 'What Instagram\'s 30-hashtag limit actually counts against — repeating a hashtag does not use up additional slots.' }
        ],
        note: 'This only recognizes a hashtag as "#" plus letters, digits, or underscores. Punctuation that is part of a word (an apostrophe, for example) ends the hashtag match at that point, matching how platforms generally parse them.'
      },
      workedExample: {
        intro: 'A caption reads: "New drop today! #sale #sale #newcollection #shoplocal #fashion"',
        rows: [
          { label: 'Hashtag matches found', value: '#sale, #sale, #newcollection, #shoplocal, #fashion (5 matches)' },
          { label: 'Unique hashtags (duplicates removed)', value: '#sale, #newcollection, #shoplocal, #fashion (4 unique)' },
          { label: 'Instagram\'s limit', value: '30' },
          { label: 'Within limit?', value: 'Yes — 4 of 30 used' }
        ],
        result: '4 unique hashtags, well within Instagram\'s 30-hashtag limit',
        explanation: 'Even though "#sale" appears twice in the caption, it only uses one of the 30 available hashtag slots — the same way Instagram\'s own caption validation treats it.'
      },
      watchOut: [
        { title: 'Only Instagram has a documented numeric hashtag limit', body: 'The 30-hashtag ceiling is specific to Instagram\'s own API documentation. Other platforms do not publish an equivalent hashtag-count limit, so this tool\'s pass/fail check only applies directly to Instagram.' },
        { title: 'Repeated hashtags count once', body: 'Posting "#sale" five times in one caption still only uses one of the 30 slots — but it also adds no extra discovery value, since the platform already knows it is the same tag.' },
        { title: 'More hashtags is not automatically better', body: 'Instagram\'s own guidance and most creator advice favor a smaller number of genuinely relevant hashtags over maximizing the count, since irrelevant tags do not help the right audience find a post.' },
        { title: 'This only extracts hashtags from plain text', body: 'It cannot tell you whether a hashtag is currently banned, shadowbanned, or restricted on any platform — that status can change and is not something a text pattern can detect.' },
        { title: 'Hashtags inside a hashtag do not split further', body: 'A chained hashtag like "#newyork2026" is detected as a single hashtag, not separated into words, matching how platforms treat it.' }
      ],
      references: [
        { label: 'Meta for Developers, Instagram Platform — IG User Media (caption parameter: 2,200 characters, 30 hashtags, 20 @ tags)', url: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/' }
      ]
    },
    seo: {
      title: 'Hashtag Counter – Instagram\'s 30-Hashtag Limit',
      description: 'Count unique hashtags in your caption and check Instagram\'s official 30-hashtag limit, confirmed from Meta\'s own Instagram Platform documentation. Lists every tag detected.',
      faq: [
        { question: 'How many hashtags should I use on Instagram?', answer: 'Instagram\'s own API documentation sets a hard limit of 30 hashtags per caption. Within that limit, Instagram\'s own creator guidance and most practical advice favor fewer, more relevant hashtags over maximizing the count.' },
        { question: 'Does a repeated hashtag count twice?', answer: 'No. This counter, like Instagram\'s own enforcement, counts unique hashtags — using "#sale" five times in one caption still counts as one hashtag toward the 30-hashtag limit.' },
        { question: 'Do hashtags work on all platforms?', answer: 'Hashtags function on Instagram, TikTok, X, LinkedIn, and Facebook, but only Instagram publishes a specific numeric hashtag-count limit (30). They have no effect on private messaging apps like WhatsApp or Messenger, which have no public feed or search.' },
        { question: 'What counts as a hashtag here?', answer: 'A "#" immediately followed by one or more letters, digits, or underscores, with no space. "#New York" would only match "#New" — the space ends the hashtag.' },
        { question: 'What happens if I exceed Instagram\'s 30-hashtag limit?', answer: 'Instagram\'s API documentation specifies the caption is rejected rather than silently truncated, so a post with 31 or more hashtags needs to be edited down before it can be published.' },
        { question: 'Does this work for captions with no hashtags?', answer: 'Yes — it will simply show a unique hashtag count of 0 and an empty extracted list, which is itself a quick way to confirm a caption has none.' }
      ]
    },
    compute() { return {}; }
  }
];
