import type { CalculatorConfig } from './types.ts';
import { PLATFORM_LIMITS } from '../../lib/platformLimits.ts';

// Options for tweet-thread-length-calculator's platform selector: code -> PLATFORM_LIMITS index,
// never the limit value itself (see template §2, "Select options are keyed by id or code").
const PLATFORM_OPTIONS = PLATFORM_LIMITS.map((p, i) => ({ value: i, label: `${p.name} (${p.limit.toLocaleString('en-US')} characters)` }));

export const textCalculators: CalculatorConfig[] = [
  // Custom-component stub: rendered by a special component in page.tsx.
  {
    id: 'character-counter',
    category: 'text',
    group: 'Social Media Text Tools',
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
    group: 'Social Media Text Tools',
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
  },
  {
    id: 'keyword-density-calculator',
    group: 'Writing & Productivity',
    category: 'text',
    glyph: 'kw%',
    updatedAt: '2026-11-18',
    aliases: ['keyword density tool', 'seo keyword density calculator', 'keyword frequency calculator', 'keyword percentage calculator', 'keyword repetition calculator'],
    related: ['character-counter', 'hashtag-counter', 'blog-ad-revenue-calculator'],
    title: 'Keyword Density Calculator',
    description: 'Find what percentage of your text a keyword or phrase makes up, or work backward to see how many times to use it for a target density. Fill in any two of the three fields.',
    example: 'Using "running shoes" 18 times in a 1,200-word article is a 1.5% keyword density (18 ÷ 1,200 × 100).',
    solver: {
      defaultTarget: 'density',
      variables: [
        { id: 'density', label: 'Keyword density', symbol: 'd', dimension: 'percent', defaultValue: 1.5, defaultUnit: '%' },
        { id: 'occurrences', label: 'Keyword occurrences', symbol: 'k', dimension: 'count', defaultValue: 15, defaultUnit: 'count' },
        { id: 'totalWords', label: 'Total word count', symbol: 'W', dimension: 'count', defaultValue: 1000, defaultUnit: 'count' }
      ],
      solve: {
        density: ({ occurrences, totalWords }) => (totalWords > 0 ? (occurrences / totalWords) * 100 : NaN),
        occurrences: ({ density, totalWords }) => (density / 100) * totalWords,
        totalWords: ({ occurrences, density }) => (density > 0 ? occurrences / (density / 100) : NaN)
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What is keyword density, and does it still matter for SEO?',
        paragraphs: [
          'Keyword density is simply how many times a word or phrase appears in a piece of text, divided by the total word count, shown as a percentage. It is one of the oldest on-page SEO metrics, from an era when search engines leaned heavily on how often a term appeared on a page to judge what the page was about.',
          'Modern search engines read language far more contextually than a raw repetition count, so there is no single "correct" density to hit. Google\'s own Search Essentials spam policies describe keyword stuffing as filling a page with keywords "unnaturally, or out of context," and its own example of the problem is repetitive phrasing that "sounds unnatural" — not a percentage threshold being crossed. In other words, Google\'s own guidance is about how the text reads, not a number from a formula like this one.',
          'That makes this calculator most useful as a sanity check rather than a target to chase: run an existing draft through it, and if the density is unexpectedly high, read the passage out loud — awkward, repetitive phrasing is usually obvious before the math confirms it. The reverse direction is useful while planning: given a word count, it shows how many natural mentions of a term would produce roughly the density you have seen work well in your own content before.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the three fields below. The third, marked auto, is calculated as you type.',
        steps: [
          { name: 'Find a density', text: 'Enter how many times the keyword appears and the total word count. The density is calculated.' },
          { name: 'Plan for a density', text: 'Enter a target density and the total word count to see how many mentions that works out to.' },
          { name: 'Check the total words needed', text: 'Enter the occurrences and a target density to see how long the piece would need to be.' },
          { name: 'Count your own text first', text: 'Use the character counter or word counter on this site to get an exact word count before typing it in here.' },
          { name: 'Read the result in context', text: 'Treat the percentage as a sanity check on natural-sounding repetition, not a pass/fail SEO score.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Density is the keyword\'s share of the total word count, as a percentage. Each field has a direct rearrangement.',
        expression: 'd = (k ÷ W) × 100\nk = (d ÷ 100) × W\nW = k ÷ (d ÷ 100)',
        terms: [
          { symbol: 'd', meaning: 'Keyword density, as a percentage of the total word count.' },
          { symbol: 'k', meaning: 'Number of times the keyword or phrase appears in the text.' },
          { symbol: 'W', meaning: 'Total word count of the text (count a multi-word phrase\'s occurrences the same way, not each word separately).' }
        ],
        note: 'This is arithmetic on the counts you provide. It does not read your text, judge relevance, or tell you whether Google will rank it — see the watch-outs below.'
      },
      workedExample: {
        intro: 'A 1,200-word blog post uses the phrase "running shoes" 18 times. What is the keyword density, and how many times would it take to reach 2% on a 1,500-word rewrite?',
        rows: [
          { label: 'Density (18 ÷ 1,200 × 100)', value: '1.5%' },
          { label: 'Rewrite target density', value: '2%' },
          { label: 'Rewrite word count', value: '1,500 words' },
          { label: 'Occurrences needed (2 ÷ 100 × 1,500)', value: '30' }
        ],
        result: '1.5% in the original · 30 mentions needed for 2% on the 1,500-word rewrite',
        explanation: 'Going from 18 mentions in 1,200 words to a comparable 2% density in a longer, 1,500-word piece takes 30 mentions, not 22 or 23 — the word count grew by 25%, and the mention count has to grow faster than that because the target density itself went up too.'
      },
      watchOut: [
        { title: 'There is no official "ideal" density', body: 'Google does not publish or endorse a target keyword density. Its spam policies describe the problem as unnatural-sounding repetition, not a specific percentage, so treat any "ideal range" you read elsewhere as an unofficial rule of thumb at best.' },
        { title: 'A high density can trigger keyword stuffing', body: 'Google\'s Search Essentials spam policies list keyword stuffing — filling a page with keywords or phrases unnaturally or out of context — as behavior that can get a page ranked lower or removed from results entirely.' },
        { title: 'Count the phrase, not its individual words', body: 'For a multi-word phrase like "running shoes," count each occurrence of the whole phrase once. Counting "running" and "shoes" separately would roughly double the apparent density.' },
        { title: 'Synonyms and variations are not counted', body: 'This only counts exact repetitions of the term you measured. Search engines also read synonyms, plurals and related phrasing, which this simple ratio cannot capture.' },
        { title: 'Get an exact word count first', body: 'This calculator does arithmetic on the numbers you type in; it does not scan your text. Use the character counter or word counter on this site first if you do not already know your exact word count.' }
      ],
      references: [
        { label: 'Google Search Central, Spam policies for Google web search — Keyword stuffing', url: 'https://developers.google.com/search/docs/essentials/spam-policies' }
      ]
    },
    inputs: [
      { id: 'occurrences', label: 'Keyword occurrences', type: 'number', placeholder: '18', defaultValue: 18, step: 1, min: 0 },
      { id: 'totalWords', label: 'Total word count', type: 'number', placeholder: '1200', defaultValue: 1200, step: 1, min: 1 }
    ],
    seo: {
      title: 'Keyword Density Calculator – Find Keyword % in Text',
      description: 'Calculate keyword density (occurrences ÷ total words), or work out how many mentions you need for a target density. Free, instant, no sign-up.',
      faq: [
        { question: 'How do you calculate keyword density?', answer: 'Divide how many times the keyword appears by the total word count, then multiply by 100. A keyword used 18 times in a 1,200-word article has a density of (18 ÷ 1,200) × 100 = 1.5%.' },
        { question: 'What is a good keyword density for SEO?', answer: 'Google does not define or endorse an ideal keyword density. Its own Search Essentials spam policies focus on whether repetition sounds natural, not on hitting a percentage, so there is no single correct number to target.' },
        { question: 'What counts as keyword stuffing?', answer: 'Google\'s spam policies describe keyword stuffing as filling a page with keywords or phrases unnaturally or out of context, in a way that disrupts natural reading, rather than defining it as crossing a specific density threshold.' },
        { question: 'How many times should I use my keyword in a 1,500-word article?', answer: 'There is no required number. As a reference point, matching the 1.5% density from the worked example above would take about 23 mentions (1.5 ÷ 100 × 1,500 = 22.5, rounded up) — but natural, readable phrasing matters more than hitting any specific count.' },
        { question: 'Does this calculator read my actual text?', answer: 'No. It only does arithmetic on the occurrence count and word count you type in. Count your keyword occurrences and total words yourself, or with the character counter or word counter on this site, first.' },
        { question: 'Should I count a keyword phrase\'s individual words separately?', answer: 'No — count each appearance of the full phrase once. Counting a two-word phrase as two separate keyword hits roughly doubles the density you calculate, which overstates how often the actual phrase appears.' }
      ]
    },
    compute(values) {
      const density = values.totalWords > 0 ? (values.occurrences / values.totalWords) * 100 : NaN;
      return { keywordDensity: density };
    }
  },
  {
    id: 'typing-speed-calculator',
    group: 'Writing & Productivity',
    category: 'text',
    glyph: 'wpm',
    updatedAt: '2026-11-18',
    aliases: ['wpm calculator', 'words per minute calculator', 'typing speed test calculator', 'typing wpm calculator', 'how fast do i type'],
    related: ['keyword-density-calculator', 'character-counter', 'hashtag-counter'],
    title: 'Typing Speed Calculator',
    description: 'Work out your typing speed in words per minute from a word count and the time it took, or the reverse: how long a word count takes at a given speed. Not a live typing test.',
    example: 'Typing 540 words in 9 minutes is 540 ÷ 9 = 60 words per minute.',
    solver: {
      defaultTarget: 'wpm',
      variables: [
        { id: 'wpm', label: 'Typing speed', symbol: 'WPM', dimension: 'count', defaultValue: 60, defaultUnit: 'count' },
        { id: 'wordsTyped', label: 'Words typed', symbol: 'N', dimension: 'count', defaultValue: 540, defaultUnit: 'count' },
        { id: 'minutesTaken', label: 'Time taken', symbol: 't', dimension: 'time', defaultValue: 9, defaultUnit: 'min' }
      ],
      solve: {
        wpm: ({ wordsTyped, minutesTaken }) => (minutesTaken > 0 ? wordsTyped / (minutesTaken / 60) : NaN),
        wordsTyped: ({ wpm, minutesTaken }) => wpm * (minutesTaken / 60),
        minutesTaken: ({ wordsTyped, wpm }) => (wpm > 0 ? (wordsTyped / wpm) * 60 : NaN)
      },
      outputs: [
        { id: 'charactersTyped', label: 'Characters typed (at 5 per word)', dimension: 'count', compute: (si) => si.wordsTyped * 5 }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'How typing speed (WPM) is measured, and what counts as a "word"',
        paragraphs: [
          'Words per minute is just a word count divided by the time it took, in minutes. This calculator is deliberately not a live typing test: it takes a word count and a duration you already have — from a typing test site, a transcription job, or timing yourself writing — and does the division (and its reverse) for you.',
          'Typing tests that measure real keystrokes almost never count "words" the way a dictionary would. Wikipedia\'s words-per-minute article, summarizing the standard used across text-entry research, states that for measuring text entry, a "word" is generally standardized to five characters or keystrokes, including spaces and punctuation — so a WPM figure quoted from a typing test is really a character-count-per-minute figure in disguise, divided by 5.',
          'That standardization is also why two people typing the same passage can report different WPM figures for the "same" speed: one tool might count actual space-separated words, while another counts every five keystrokes as a word regardless of where they fall. This calculator only needs the word count you already have; it does not need to know which convention produced it.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the three fields below. The third, marked auto, is calculated as you type.',
        steps: [
          { name: 'Find your speed', text: 'Enter the words you typed and the time it took. Your words-per-minute speed is calculated.' },
          { name: 'Plan how long something will take', text: 'Enter your typing speed and a word count to see the time needed.' },
          { name: 'Plan how much you can type in a session', text: 'Enter your typing speed and the minutes you have available to see the word count.' },
          { name: 'Time yourself first', text: 'Use a stopwatch or a typing-test site\'s own timer, then bring the word count and time here.' },
          { name: 'Read the character estimate', text: 'The result also shows an estimated character count, using the standard 5-characters-per-word convention described above.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Typing speed is words divided by minutes. Each field has a direct rearrangement.',
        expression: 'WPM = N ÷ t\nN = WPM × t\nt = N ÷ WPM',
        terms: [
          { symbol: 'WPM', meaning: 'Typing speed in words per minute.' },
          { symbol: 'N', meaning: 'Number of words typed.' },
          { symbol: 't', meaning: 'Time taken, in minutes.' }
        ],
        note: 'This is arithmetic on the word count and time you provide — it does not time you or check what you typed for accuracy.'
      },
      workedExample: {
        intro: 'You type a 540-word passage in 9 minutes. What is your typing speed, and how long would a 1,000-word document take at 40 WPM?',
        rows: [
          { label: 'Typing speed (540 ÷ 9)', value: '60 WPM' },
          { label: 'Characters typed (540 × 5)', value: '2,700' },
          { label: '1,000 words at 40 WPM (1,000 ÷ 40)', value: '25 minutes' }
        ],
        result: '60 WPM for the 540-word passage · 25 minutes for 1,000 words at 40 WPM',
        explanation: '60 WPM falls within the 43-to-80-WPM range Wikipedia\'s words-per-minute article cites for professional typists, well above the roughly 32.5 WPM a 1999 study found for average computer users transcribing text.'
      },
      watchOut: [
        { title: 'This is not a live typing test', body: 'It does arithmetic on a word count and a time you already have. For an actual timed test with real-time accuracy tracking, use a dedicated typing-test tool, then bring the results here.' },
        { title: '"Words" usually means 5 characters, not dictionary words', body: 'Most typing tests standardize a "word" to 5 characters or keystrokes, including spaces, rather than counting actual space-separated words — so comparing WPM figures across different tools or tests can be misleading unless you know they use the same convention.' },
        { title: 'This does not account for accuracy', body: 'A raw word-count-over-time figure (sometimes called "gross" WPM) does not subtract errors. Many typing tests report a lower "net" WPM that penalizes mistakes — this calculator only computes the raw figure from the counts you enter.' },
        { title: 'Typing speed varies by task', body: 'Copying familiar text, composing original writing, and transcribing from audio produce different speeds for the same person — a 1999 study found an average of 32.5 WPM for transcription versus 19.0 WPM for composition in the same group of computer users.' },
        { title: 'Benchmarks are reference points, not targets', body: 'The professional-typist and average-user figures cited here come from specific studies cited in Wikipedia\'s words-per-minute article, not a universal standard everyone is measured against.' }
      ],
      references: [
        { label: 'Wikipedia, Words per minute', url: 'https://en.wikipedia.org/wiki/Words_per_minute' }
      ]
    },
    inputs: [
      { id: 'wordsTyped', label: 'Words typed', type: 'number', placeholder: '540', defaultValue: 540, step: 1, min: 0 },
      { id: 'minutesTaken', label: 'Time taken (minutes)', type: 'number', placeholder: '9', defaultValue: 9, step: 0.1, min: 0.01 }
    ],
    seo: {
      title: 'Typing Speed Calculator – Words Per Minute (WPM)',
      description: 'Calculate typing speed in words per minute from a word count and time, or find the time or word count for a target WPM. Not a live typing test.',
      faq: [
        { question: 'How do you calculate words per minute?', answer: 'Divide the number of words typed by the time in minutes. Typing 540 words in 9 minutes is 540 ÷ 9 = 60 WPM.' },
        { question: 'What counts as a "word" in a WPM score?', answer: 'Most typing tests standardize a word to 5 characters or keystrokes, including spaces, rather than counting actual words — a convention described in Wikipedia\'s words-per-minute article summarizing text-entry research.' },
        { question: 'What is a good typing speed?', answer: 'Wikipedia\'s words-per-minute article cites 43-80 WPM for professional typists (with some roles requiring 80-95 and advanced typists exceeding 120), versus around 32.5 WPM a 1999 study found for average computer users transcribing text.' },
        { question: 'Is this a real typing test?', answer: 'No. It takes a word count and elapsed time you already have and divides one by the other. For a live, keystroke-by-keystroke test, use a dedicated typing-test tool.' },
        { question: 'Does this calculate net WPM (with error penalties)?', answer: 'No, only gross WPM — words divided by time, with no deduction for mistakes. A typing test that reports "net WPM" is subtracting an error penalty this calculator does not have the data to apply.' },
        { question: 'How long will a document take to type?', answer: 'Divide the word count by your typing speed. A 1,000-word document at 40 WPM takes 1,000 ÷ 40 = 25 minutes.' }
      ]
    },
    compute(values) {
      const wpm = values.minutesTaken > 0 ? values.wordsTyped / values.minutesTaken : NaN;
      return { typingSpeedWpm: wpm };
    }
  },
  {
    id: 'script-reading-time-calculator',
    group: 'Writing & Productivity',
    category: 'text',
    glyph: 'spk',
    updatedAt: '2026-11-18',
    aliases: ['video script timer', 'voiceover time calculator', 'speaking time calculator', 'how long is my script', 'words to minutes calculator'],
    related: ['typing-speed-calculator', 'character-counter', 'keyword-density-calculator'],
    title: 'Script Reading Time Calculator',
    description: 'Estimate how long a script takes to read aloud for a video, podcast or presentation, using a speaking rate you choose — slower than silent reading. Fill in any two fields.',
    example: 'A 700-word script at 140 words per minute, a typical narration pace, takes about 5 minutes to read aloud.',
    solver: {
      defaultTarget: 'minutes',
      variables: [
        { id: 'minutes', label: 'Spoken reading time', symbol: 't', dimension: 'time', defaultValue: 5, defaultUnit: 'min' },
        { id: 'words', label: 'Script word count', symbol: 'N', dimension: 'count', defaultValue: 700, defaultUnit: 'count' },
        { id: 'rate', label: 'Speaking rate', symbol: 'r', dimension: 'count', defaultValue: 140, defaultUnit: 'count' }
      ],
      solve: {
        minutes: ({ words, rate }) => (rate > 0 ? (words / rate) * 60 : NaN),
        words: ({ rate, minutes }) => rate * (minutes / 60),
        rate: ({ words, minutes }) => (minutes > 0 ? words / (minutes / 60) : NaN)
      },
      outputs: [
        { id: 'silentReadingTime', label: 'Silent reading time, for comparison (200 wpm)', dimension: 'time', unit: 'min', compute: (si) => (si.words / 200) * 60 }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why a script reads slower than silent reading, and what rate to use',
        paragraphs: [
          'Reading a script out loud takes longer per word than reading the same text silently, because speech adds pauses for breath, emphasis and pacing that silent reading skips entirely. This calculator defaults to 140 words per minute for spoken delivery, deliberately slower than the 200-words-per-minute silent-reading estimate used elsewhere on this site (on the character counter) — the two numbers measure different things and are not interchangeable.',
          'Wikipedia\'s words-per-minute article, summarizing speech-rate research, states that slide presentations average closer to 100-125 wpm "for a comfortable pace," while audiobook narration runs 150-160 wpm, "the range that people comfortably hear." This calculator\'s 140 wpm default sits between those two cited figures — a reasonable starting point for a video or podcast script, which is usually paced somewhere between a slow, deliberate presentation and a smoothly narrated audiobook.',
          'Every script and speaker is different, though, so the rate field is yours to change. A technical explainer with pauses for on-screen diagrams reads slower than a fast-cut highlight reel; a naturally quick talker will clear a script faster than a deliberate one reading the identical words. Time a short section of your own delivery and use that rate here for a far more accurate estimate than any default.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of the three fields below. The third, marked auto, is calculated as you type.',
        steps: [
          { name: 'Estimate your runtime', text: 'Enter your script\'s word count and a speaking rate to see how long it takes to read aloud.' },
          { name: 'Write to a target length', text: 'Enter your target runtime and a speaking rate to see how many words to write.' },
          { name: 'Find your own speaking rate', text: 'Enter a word count and the time it actually took you to read it, to calculate your personal rate.' },
          { name: 'Start from the default, then adjust', text: 'The 140 wpm default sits between typical presentation and audiobook-narration pace — time yourself for a more accurate figure.' },
          { name: 'Compare to silent reading', text: 'The bonus figure below the result shows how much longer the same text takes spoken aloud than read silently at 200 wpm.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Spoken time is the word count divided by the speaking rate. Each field has a direct rearrangement.',
        expression: 't = N ÷ r\nN = r × t\nr = N ÷ t',
        terms: [
          { symbol: 't', meaning: 'Spoken reading time, in minutes.' },
          { symbol: 'N', meaning: 'Number of words in the script.' },
          { symbol: 'r', meaning: 'Speaking rate, in words per minute.' }
        ],
        note: 'An estimate. Pauses for visuals, emphasis, or a slower-than-usual delivery will all push the real time above this figure.'
      },
      workedExample: {
        intro: 'A 700-word video script is read aloud at the default 140 wpm narration pace. How long does it run, and how does that compare to reading the same 700 words silently?',
        rows: [
          { label: 'Spoken time (700 ÷ 140)', value: '5 minutes' },
          { label: 'Silent reading time (700 ÷ 200)', value: '3.5 minutes' },
          { label: 'Difference', value: '1.5 minutes longer spoken' }
        ],
        result: 'About 5 minutes spoken · 3.5 minutes silent for the same 700 words',
        explanation: 'Spoken delivery at 140 wpm takes 42.9% longer than silent reading at 200 wpm for the same text — a fixed ratio (200 ÷ 140) that holds regardless of word count, not something specific to this 700-word example.'
      },
      watchOut: [
        { title: 'Not the same figure as this site\'s reading-time estimate', body: 'The character counter\'s 200 wpm reading-time figure is for silent reading of on-screen text. This calculator\'s 130-150 wpm range is for reading aloud — using one rate for the other\'s purpose will give a noticeably wrong estimate.' },
        { title: 'The default is a starting point, not your rate', body: 'The 140 wpm default sits between the 100-125 wpm Wikipedia cites for slide presentations and the 150-160 wpm it cites for audiobook narration. Timing your own delivery of a short passage and entering that rate will always beat any default.' },
        { title: 'Pauses and visuals add time this does not count', body: 'A script with planned pauses, on-screen diagrams, or b-roll without narration runs longer than the word-count math alone predicts. Build in extra time for those sections separately.' },
        { title: 'Faster is not automatically better for video', body: 'A rate that feels natural in conversation can feel rushed on camera, where pacing also serves the edit. Many creators deliberately slow down from their conversational rate when recording.' },
        { title: 'Language and speaker both change the rate', body: 'Speaking rates vary by language and by individual speaker. Treat the cited figures as an English-language, general-audience reference point, not a universal constant.' }
      ],
      references: [
        { label: 'Wikipedia, Words per minute', url: 'https://en.wikipedia.org/wiki/Words_per_minute' }
      ]
    },
    inputs: [
      { id: 'scriptWordCount', label: 'Script word count', type: 'number', placeholder: '700', defaultValue: 700, step: 1, min: 0 },
      { id: 'speakingRateWpm', label: 'Speaking rate (words per minute)', type: 'number', placeholder: '140', defaultValue: 140, step: 1, min: 1 }
    ],
    seo: {
      title: 'Script Reading Time Calculator – Video & Podcast Scripts',
      description: 'Estimate how long a video, podcast or presentation script takes to read aloud at a speaking rate you choose (default 140 wpm), distinct from silent-reading time.',
      faq: [
        { question: 'How long does it take to read a script out loud?', answer: 'Divide the word count by your speaking rate in words per minute. A 700-word script at 140 wpm takes 700 ÷ 140 = 5 minutes.' },
        { question: 'What speaking rate should I use for a video script?', answer: 'This calculator defaults to 140 wpm, between the 100-125 wpm Wikipedia\'s words-per-minute article cites for slide presentations and the 150-160 wpm it cites for audiobook narration. Timing your own delivery gives a more accurate figure than any default.' },
        { question: 'Why is this different from the reading-time figure on the character counter?', answer: 'The character counter estimates silent reading of on-screen text at 200 wpm. This calculator estimates speaking a script aloud, which is slower — about 42.9% longer for the same word count at this calculator\'s 140 wpm default.' },
        { question: 'How many words should my script be for a 2-minute video?', answer: 'Multiply the target minutes by your speaking rate. At 140 wpm, 2 minutes is 140 × 2 = 280 words.' },
        { question: 'Does this account for pauses or visuals?', answer: 'No. It is a word-count-divided-by-rate estimate. Planned pauses, on-screen diagrams, or silent b-roll sections will make the real runtime longer than this figure.' },
        { question: 'Is the speaking rate the same in every language?', answer: 'No. Speaking rates vary by language and by individual speaker. The figures cited here are for English-language narration and presentation speech.' }
      ]
    },
    compute(values) {
      const minutes = values.speakingRateWpm > 0 ? values.scriptWordCount / values.speakingRateWpm : NaN;
      return { estimatedMinutes: minutes };
    }
  },
  {
    id: 'tweet-thread-length-calculator',
    group: 'Social Media Text Tools',
    category: 'text',
    glyph: '#n',
    updatedAt: '2026-11-18',
    aliases: ['twitter thread calculator', 'thread length calculator', 'how many tweets calculator', 'tweetstorm calculator', 'sms segment calculator'],
    related: ['character-counter', 'hashtag-counter', 'keyword-density-calculator'],
    title: 'Tweet Thread Length Calculator',
    description: 'Work out how many posts or message segments a piece of text needs once it is split to fit a platform\'s character limit, with an optional reserve for "1/12"-style numbering.',
    example: 'An 840-character caption split for X (280-character limit) needs 3 posts with no numbering reserved, or 4 once 6 characters per post are reserved for a "(n/total)" label.',
    breakdown: {
      headline: 'postsNeeded',
      headlineLabel: 'Posts needed',
      outputs: [
        { id: 'postsNeeded', format: 'integer' },
        { id: 'usablePerPost', label: 'Usable characters per post', format: 'integer' },
        { id: 'lastPostCharacters', label: 'Characters in the last post', format: 'integer' }
      ],
      groups: [
        { title: 'Your text', inputs: ['totalCharacters', 'platform'] },
        { title: 'Thread numbering', inputs: ['reservedPerPost'], optional: true }
      ]
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Splitting text to fit a character limit',
        paragraphs: [
          'Once a piece of text is longer than a platform\'s character limit, it has to be split into multiple posts or message segments. This calculator divides your total character count by the usable space in each post — the platform\'s limit, minus any characters you reserve for a numbering label like " (3/12)" — and rounds up, since a partly-filled final post still counts as one more post.',
          'The platform figures below are the same confirmed limits used elsewhere on this site\'s character counter: each one is documented in that platform\'s own developer or help documentation, or (for SMS) the mobile messaging standard, not a universal web rule. SMS is included because the same arithmetic answers a related, very common question — how many 160-character segments a long text message will be billed or split as.',
          'Reserving characters for numbering only matters if you plan to add it yourself: a thread posted natively on X or Instagram does not require it, but many writers add a "(1/12)" style label so readers can follow a thread that gets separated or reordered. Leave the reserve at 0 if you are not adding one.'
        ]
      },
      howTo: {
        intro: 'Enter your total character count, pick a platform, and optionally reserve space for numbering.',
        steps: [
          { name: 'Count your characters', text: 'Use the character counter on this site to get an exact count of the text you want to split, then enter it here.' },
          { name: 'Pick a platform', text: 'Choose the platform or message type whose character limit you are splitting against.' },
          { name: 'Reserve space for numbering, if you want it', text: 'If you plan to label each post "(n/total)", enter roughly how many characters that label takes — 6 covers up to "(12/12)".' },
          { name: 'Read the result', text: 'The headline is how many posts you need. Below it, the usable characters per post and the length of the final, partly-filled post.' },
          { name: 'Leave the reserve at 0 for SMS', text: 'Phones number multi-part text messages automatically outside the character limit, so there is usually nothing to reserve space for there.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Each post holds the platform limit minus any reserved numbering space. The number of posts is the total divided by that, rounded up.',
        expression: 'usable = limit − reserved\nposts = ⌈total ÷ usable⌉\nlastPost = total − (posts − 1) × usable',
        terms: [
          { symbol: 'total', meaning: 'Total character count of the text being split.' },
          { symbol: 'limit', meaning: 'The platform\'s character limit per post or segment.' },
          { symbol: 'reserved', meaning: 'Characters set aside per post for your own numbering label, if any.' },
          { symbol: 'posts', meaning: 'Number of posts or segments needed, always rounded up to a whole number.' }
        ],
        note: 'This only does the character arithmetic — it does not split your actual text or decide where to break paragraphs or sentences.'
      },
      workedExample: {
        intro: 'An 840-character piece of text needs to be split for X, whose limit is 280 characters. How many posts, with and without a 6-character "(n/total)" numbering reserve?',
        rows: [
          { label: 'No reserve: usable per post (280 − 0)', value: '280' },
          { label: 'No reserve: posts (⌈840 ÷ 280⌉)', value: '3' },
          { label: 'With a 6-char reserve: usable per post (280 − 6)', value: '274' },
          { label: 'With a 6-char reserve: posts (⌈840 ÷ 274⌉)', value: '4' }
        ],
        result: '3 posts with no numbering reserve · 4 posts once 6 characters per post are reserved',
        explanation: 'Reserving space for numbering can push the post count up by one even though the underlying text did not change: 840 characters fits exactly into 3 posts of 280, but only 3 × 274 = 822 characters fit once 6 are reserved from each, leaving 18 characters that need a 4th post.'
      },
      watchOut: [
        { title: 'Rounding up is not optional', body: 'A post that is even 1 character over the previous post\'s capacity needs its own, additional post — there is no such thing as a 0.1 of a post, so the count always rounds up to a whole number.' },
        { title: 'A numbering reserve can add a whole extra post', body: 'As the worked example shows, reserving characters for a "(n/total)" label reduces the usable space in every post, which can tip the total post count up by one even for text that fit exactly before.' },
        { title: 'This counts characters, not words or sentences', body: 'A platform limit is a character count. Splitting a thread also means choosing sensible break points — mid-sentence breaks are easy to produce by raw character counting but awkward to read.' },
        { title: 'SMS segments are usually numbered for you', body: 'Phones and carriers typically add "(1/3)"-style labels to a multi-part text message outside the counted character limit, so a reserve is usually unnecessary for the SMS option — leave it at 0 unless you know otherwise.' },
        { title: 'Emoji and non-Latin characters lower the SMS limit further', body: 'The SMS figures here follow the character counter\'s own GSM-7 (160) and UCS-2 (70) distinction: adding one emoji or non-Latin character to an SMS switches the whole message to the lower 70-character limit, which can significantly increase the segment count.' }
      ],
      references: [
        { label: 'X (Twitter) Developer Platform, Counting characters', url: 'https://docs.x.com/fundamentals/counting-characters' },
        { label: 'Meta for Developers, Instagram Platform — IG User Media (caption parameter)', url: 'https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media/' },
        { label: 'LinkedIn Help, Post and Share Updates', url: 'https://www.linkedin.com/help/linkedin/answer/a528176' },
        { label: 'Twilio, How Long Can a Text Message Be? (SMS character limits)', url: 'https://www.twilio.com/docs/glossary/what-sms-character-limit' }
      ]
    },
    inputs: [
      { id: 'totalCharacters', label: 'Total character count', type: 'number', placeholder: '840', defaultValue: 840, step: 1, min: 0 },
      { id: 'platform', label: 'Platform', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: PLATFORM_OPTIONS },
      { id: 'reservedPerPost', label: 'Characters reserved per post for numbering', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0 }
    ],
    seo: {
      title: 'Tweet Thread Length Calculator – How Many Posts?',
      description: 'Work out how many posts or SMS segments your text needs once split to fit X, Instagram, LinkedIn, YouTube or SMS character limits, with optional numbering space.',
      faq: [
        { question: 'How many tweets will my text take?', answer: 'Divide your total character count by X\'s 280-character limit (minus any characters you reserve for numbering) and round up. An 840-character caption with no numbering reserve needs ⌈840 ÷ 280⌉ = 3 posts.' },
        { question: 'How do I count a multi-part text message?', answer: 'Pick the SMS option (160 characters for plain text, 70 if it includes an emoji or non-Latin character) and leave the numbering reserve at 0, since phones label message parts outside the counted limit.' },
        { question: 'Why does reserving characters for numbering increase the post count?', answer: 'Reserving space shrinks how much usable text fits in every post. An 840-character text fits exactly into 3 posts of 280 characters, but only into 3 posts of 274 once 6 characters per post are reserved for a label, pushing the last 18 characters into a 4th post.' },
        { question: 'Does this split my actual text into posts for me?', answer: 'No. It only calculates how many posts you will need and how long the final one is, from the character count and platform limit you provide — you still choose where each post breaks.' },
        { question: 'What character limit does this use for each platform?', answer: 'The same confirmed limits as this site\'s character counter: X 280, Instagram caption 2,200, LinkedIn 3,000, YouTube title 100, YouTube description 5,000, and SMS 160 (GSM-7) or 70 (with an emoji or non-Latin character).' },
        { question: 'How many characters should I reserve for a "(1/12)" label?', answer: 'Six characters covers any thread up to 99 posts, such as "(12/99)". Shorter threads could use less, but 6 is a safe default that will not under-reserve as the thread gets longer.' }
      ]
    },
    compute(values) {
      const limit = PLATFORM_LIMITS[values.platform]?.limit ?? PLATFORM_LIMITS[0].limit;
      const usablePerPost = Math.max(1, limit - values.reservedPerPost);
      const postsNeeded = Math.ceil(values.totalCharacters / usablePerPost);
      const lastPostCharacters = values.totalCharacters - (postsNeeded - 1) * usablePerPost;
      return { postsNeeded, usablePerPost, lastPostCharacters };
    }
  },
  {
    id: 'readability-score-calculator',
    group: 'Word Count & Readability',
    category: 'text',
    glyph: 'FK',
    updatedAt: '2026-11-18',
    aliases: ['flesch kincaid calculator', 'reading level calculator', 'grade level calculator', 'flesch reading ease calculator', 'text difficulty calculator'],
    related: ['character-counter', 'typing-speed-calculator', 'keyword-density-calculator'],
    title: 'Readability Score Calculator',
    description: 'Calculate the Flesch-Kincaid Grade Level and Flesch Reading Ease score from a word, sentence and syllable count — the standard formulas behind most readability checks.',
    example: 'A 150-word passage with 10 sentences and 225 syllables scores a 7.96 grade level and a 64.7 reading-ease score — "plain English," per the Flesch scale.',
    breakdown: {
      headline: 'gradeLevel',
      headlineLabel: 'Flesch-Kincaid grade level',
      outputs: [
        { id: 'gradeLevel', format: 'number' },
        { id: 'readingEase', label: 'Flesch Reading Ease score', format: 'number' }
      ],
      groups: [{ title: 'Text counts', inputs: ['words', 'sentences', 'syllables'] }],
      visual: {
        type: 'rangeBar',
        value: 'readingEase',
        title: 'Flesch Reading Ease',
        bands: [
          { label: 'Extremely difficult (professional)', min: -100, max: 10, color: '#dc2626' },
          { label: 'Very difficult (college graduate)', min: 10, max: 30, color: '#ea580c' },
          { label: 'Difficult (college)', min: 30, max: 50, color: '#f59e0b' },
          { label: 'Fairly difficult (10th-12th grade)', min: 50, max: 60, color: '#eab308' },
          { label: 'Plain English (8th & 9th grade)', min: 60, max: 70, color: '#84cc16' },
          { label: 'Fairly easy (7th grade)', min: 70, max: 80, color: '#22c55e' },
          { label: 'Easy (6th grade)', min: 80, max: 90, color: '#16a34a' },
          { label: 'Very easy (5th grade)', min: 90, max: 150, color: '#15803d' }
        ]
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'What the Flesch-Kincaid formulas measure, and where they come from',
        paragraphs: [
          'The Flesch-Kincaid Grade Level and Flesch Reading Ease are two readability formulas built from the same two ratios: average sentence length (words per sentence) and average word length (syllables per word). Longer sentences and longer, more multi-syllable words both push the grade level up and the reading-ease score down — the two scores move in opposite directions on purpose, one estimating a US school grade and the other a 0-100 "ease" score.',
          'The grade-level formula comes from Kincaid, Fishburne, Rogers and Chissom\'s 1975 report for the US Navy, "Derivation of New Readability Formulas," which adapted Rudolf Flesch\'s earlier Reading Ease formula into a direct school-grade estimate for Navy training materials. Both formulas remain in wide use today, built into word processors and plain-language style guides.',
          'Because both scores are built only from sentence length and syllable count, they measure text structure, not meaning. A sentence full of short, common words about a confusing topic can still score "easy," and a short sentence using one unfamiliar multi-syllable term can score "difficult." Treat the result as a structural proxy for reading difficulty, not a verified measure of whether a reader will understand the content.'
        ]
      },
      howTo: {
        intro: 'Enter the word, sentence and syllable counts for the passage you want to score.',
        steps: [
          { name: 'Count the words', text: 'Use the word counter or character counter on this site, or your word processor\'s own count, for an exact figure.' },
          { name: 'Count the sentences', text: 'Count runs of sentence-ending punctuation (. ! ?), the same convention the character counter on this site uses.' },
          { name: 'Count the syllables', text: 'Use the syllable counter on this site for an estimate, or count them yourself for full accuracy.' },
          { name: 'Read the grade level', text: 'The headline figure is the estimated US school grade needed to read the passage comfortably.' },
          { name: 'Check the reading-ease band', text: 'The bar below shows where the Flesch Reading Ease score falls, from "extremely difficult" to "very easy."' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Both formulas are built from the same two ratios: average sentence length and average word length in syllables.',
        expression: 'ASL = words ÷ sentences\nASW = syllables ÷ words\nGrade = 0.39 × ASL + 11.8 × ASW − 15.59\nEase = 206.835 − 1.015 × ASL − 84.6 × ASW',
        terms: [
          { symbol: 'ASL', meaning: 'Average sentence length: words per sentence.' },
          { symbol: 'ASW', meaning: 'Average syllables per word.' },
          { symbol: 'Grade', meaning: 'Flesch-Kincaid Grade Level: an estimated US school grade.' },
          { symbol: 'Ease', meaning: 'Flesch Reading Ease: a 0-100 scale (higher is easier), though the formula can produce scores slightly outside that range.' }
        ],
        note: 'A structural estimate from sentence and syllable counts, not a measure of whether the content itself is understandable.'
      },
      workedExample: {
        intro: 'A 150-word passage has 10 sentences and 225 syllables. What is its grade level and reading-ease score?',
        rows: [
          { label: 'ASL (150 ÷ 10)', value: '15 words/sentence' },
          { label: 'ASW (225 ÷ 150)', value: '1.5 syllables/word' },
          { label: 'Grade (0.39 × 15 + 11.8 × 1.5 − 15.59)', value: '7.96' },
          { label: 'Ease (206.835 − 1.015 × 15 − 84.6 × 1.5)', value: '64.71' }
        ],
        result: 'Grade level 7.96 · Reading Ease 64.71 ("Plain English," 8th & 9th grade)',
        explanation: 'The two scores agree: a 7.96 grade level and a 64.71 reading-ease score both land in the same "8th & 9th grade, Plain English" range, since both come from the same 15-words-per-sentence, 1.5-syllables-per-word structure.'
      },
      watchOut: [
        { title: 'Two scales, opposite directions', body: 'A higher grade level means harder-to-read text, but a higher reading-ease score means easier-to-read text. Mixing up which direction is "better" on each scale is an easy mistake.' },
        { title: 'The score can go below 0 or above 100', body: 'The Reading Ease formula has no built-in floor or ceiling: very short, simple sentences can score just over 100, and very long, syllable-heavy sentences can score below 0. Both are the formula working as designed, not a bug.' },
        { title: 'This measures structure, not comprehension', body: 'A text about a difficult subject written in short, common words can still score "easy," and a short sentence containing one unfamiliar technical term can score "difficult." The formula cannot tell whether a reader actually understands the content.' },
        { title: 'Garbage counts in, garbage score out', body: 'The result is only as accurate as the word, sentence and syllable counts you provide. Use a consistent counting method — this site\'s own word counter, character counter and syllable counter use the same conventions as the worked example above.' },
        { title: 'Built for English', body: 'Both formulas were derived from English-language text and its typical syllable and sentence patterns. Applying them to another language\'s text will not give a meaningful score.' }
      ],
      references: [
        { label: 'Wikipedia, Flesch-Kincaid readability tests', url: 'https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests' }
      ]
    },
    inputs: [
      { id: 'words', label: 'Word count', type: 'number', placeholder: '150', defaultValue: 150, step: 1, min: 1 },
      { id: 'sentences', label: 'Sentence count', type: 'number', placeholder: '10', defaultValue: 10, step: 1, min: 1 },
      { id: 'syllables', label: 'Syllable count', type: 'number', placeholder: '225', defaultValue: 225, step: 1, min: 1 }
    ],
    seo: {
      title: 'Readability Score Calculator – Flesch-Kincaid Grade',
      description: 'Calculate the Flesch-Kincaid Grade Level and Flesch Reading Ease score from word, sentence and syllable counts. Free, instant, cites the original formulas.',
      faq: [
        { question: 'How do you calculate the Flesch-Kincaid grade level?', answer: 'Grade = 0.39 × (words ÷ sentences) + 11.8 × (syllables ÷ words) − 15.59. A 150-word, 10-sentence, 225-syllable passage scores 0.39 × 15 + 11.8 × 1.5 − 15.59 = 7.96.' },
        { question: 'What is a good Flesch Reading Ease score?', answer: 'Higher is easier to read: 90-100 is "very easy" (5th grade), 60-70 is "plain English" (8th & 9th grade), and below 30 is "very difficult" (college graduate level), per the scale in Wikipedia\'s Flesch-Kincaid readability tests article.' },
        { question: 'Where do these formulas come from?', answer: 'The grade-level formula is from Kincaid, Fishburne, Rogers and Chissom\'s 1975 US Navy report, which adapted Rudolf Flesch\'s earlier Reading Ease formula into a direct school-grade estimate.' },
        { question: 'How do I count syllables for this calculator?', answer: 'Use the syllable counter on this site for an estimate, or count them by hand. The result is only as accurate as the syllable count you provide.' },
        { question: 'Can the reading-ease score go above 100 or below 0?', answer: 'Yes. The formula has no built-in limit — extremely short, simple sentences can score just over 100, and long, syllable-heavy sentences can score below 0.' },
        { question: 'Does a high grade level mean the writing is bad?', answer: 'Not necessarily. These formulas measure sentence and word length, not quality or clarity. Technical or legal writing often scores a high grade level because the subject itself requires longer sentences and specific terminology.' }
      ]
    },
    compute(values) {
      const asl = values.sentences > 0 ? values.words / values.sentences : NaN;
      const asw = values.words > 0 ? values.syllables / values.words : NaN;
      const gradeLevel = 0.39 * asl + 11.8 * asw - 15.59;
      const readingEase = 206.835 - 1.015 * asl - 84.6 * asw;
      return { gradeLevel, readingEase };
    }
  },
  {
    id: 'word-to-page-count-calculator',
    group: 'Word Count & Readability',
    category: 'text',
    glyph: 'pg',
    updatedAt: '2026-11-18',
    aliases: ['words to pages calculator', 'page count calculator', 'word count to pages', 'how many pages is my essay', 'pages to words calculator'],
    related: ['readability-score-calculator', 'character-counter', 'typing-speed-calculator'],
    title: 'Word to Page Count Calculator',
    description: 'Estimate how many pages a word count fills, single- or double-spaced, using the standard manuscript-format estimate of 250 words per double-spaced page.',
    example: 'A 1,250-word essay runs about 5 pages double-spaced, or 2.5 pages single-spaced.',
    breakdown: {
      headline: 'pages',
      headlineLabel: 'Estimated pages',
      outputs: [
        { id: 'pages', format: 'number' },
        { id: 'otherSpacingPages', label: 'Pages at the other spacing', format: 'number' }
      ],
      groups: [{ title: 'Your text', inputs: ['words', 'spacing'] }],
      visual: {
        type: 'compareBars',
        bars: [{ from: 'pages', label: 'At your spacing' }, { from: 'otherSpacingPages', label: 'At the other spacing' }],
        title: 'Pages by spacing'
      }
    },
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Why 250 words is the standard double-spaced page estimate',
        paragraphs: [
          'This calculator uses the long-standing publishing-industry estimate for a double-spaced manuscript page: Wikipedia\'s "Standard manuscript format" article states that with margins set for about 25 lines per page and roughly 10 words per line, an editor can "easily count 250 words per page." That 25-lines-per-page, 10-words-per-line arithmetic is specific to a standard 12-point font, 1-inch margins and double-spaced lines — the same formatting most schools and style guides (MLA, APA) require for essays.',
          'Single-spacing roughly doubles how many lines fit on the same page — about 50 instead of 25 — which is why this calculator estimates 500 words per single-spaced page: double the double-spaced figure, not a separately published number of its own.',
          'Either figure is an estimate, not a measurement of your actual document. Font, font size, margins, headings, block quotes and images all change how many words actually fit on a page — this calculator answers "roughly how many pages," useful for planning before you have written the piece, not "exactly how many pages my finished, formatted document will be."'
        ]
      },
      howTo: {
        intro: 'Enter your word count and choose single- or double-spacing.',
        steps: [
          { name: 'Get your word count', text: 'Use the word counter or character counter on this site, or your word processor\'s own count.' },
          { name: 'Choose your spacing', text: 'Pick double-spaced (the common default for essays and manuscripts) or single-spaced.' },
          { name: 'Read the page estimate', text: 'The headline is your estimated page count at the spacing you chose.' },
          { name: 'Compare the other spacing', text: 'The second figure and chart show what the same word count would run to at the other spacing.' },
          { name: 'Work backward from a page target', text: 'If an assignment asks for "5 pages," multiply 5 by 250 (double-spaced) or 500 (single-spaced) to get a target word count.' }
        ],
        outro: 'Everything is calculated in your browser. Nothing you type is sent or stored.'
      },
      formula: {
        intro: 'Pages are the word count divided by words-per-page, which depends on spacing.',
        expression: 'pages = words ÷ 250   (double-spaced)\npages = words ÷ 500   (single-spaced)',
        terms: [
          { symbol: 'words', meaning: 'Total word count of the document.' },
          { symbol: '250', meaning: 'Estimated words per double-spaced page, from standard manuscript formatting.' },
          { symbol: '500', meaning: 'Estimated words per single-spaced page — roughly double, since single-spacing roughly doubles the lines per page.' }
        ],
        note: 'An estimate based on typical formatting (12-point font, 1-inch margins). Your actual page count will vary with font, font size, margins and how much of the page is headings, images or white space.'
      },
      workedExample: {
        intro: 'A 1,250-word essay needs to be submitted double-spaced. How many pages is that, and how many would it be single-spaced instead?',
        rows: [
          { label: 'Double-spaced (1,250 ÷ 250)', value: '5 pages' },
          { label: 'Single-spaced (1,250 ÷ 500)', value: '2.5 pages' }
        ],
        result: 'About 5 pages double-spaced · 2.5 pages single-spaced',
        explanation: 'Single-spacing the same 1,250 words takes exactly half as many pages as double-spacing it (2.5 versus 5), because the words-per-page estimate for single-spacing is exactly double the double-spaced figure.'
      },
      watchOut: [
        { title: 'This is an estimate, not your document\'s actual page count', body: 'Font choice, font size, margin width, headings, block quotes, images and citations all change how many words actually fit on a page. Treat this as a planning estimate, not a guarantee of your finished page count.' },
        { title: 'The 250/500 figures assume standard formatting', body: 'These numbers assume roughly a 12-point font and 1-inch margins, the formatting most schools and style guides require. A larger font, wider margins or extra line spacing will fit fewer words per page than this estimate.' },
        { title: 'A "page" means different things in different contexts', body: 'Fiction manuscripts, legal documents and academic papers can all use different standard formatting. This calculator uses the common double-spaced academic/manuscript convention, not every possible page format.' },
        { title: 'Headings and white space take up page space too', body: 'A page with a large heading, a chart, or significant white space holds noticeably fewer words than a page of continuous text, so a document with many such breaks will run longer than this estimate predicts.' },
        { title: 'Use it in both directions', body: 'This works just as well backward: to hit a "5-page" assignment target double-spaced, aim for about 5 × 250 = 1,250 words, then treat the actual page count in your word processor as the final word.' }
      ],
      references: [
        { label: 'Wikipedia, Standard manuscript format', url: 'https://en.wikipedia.org/wiki/Standard_manuscript_format' }
      ]
    },
    inputs: [
      { id: 'words', label: 'Word count', type: 'number', placeholder: '1250', defaultValue: 1250, step: 1, min: 0 },
      { id: 'spacing', label: 'Spacing', type: 'number', placeholder: '0', defaultValue: 0, step: 1, min: 0, options: [{ value: 0, label: 'Double-spaced' }, { value: 1, label: 'Single-spaced' }] }
    ],
    seo: {
      title: 'Word to Page Count Calculator – Words to Pages',
      description: 'Estimate how many pages a word count fills, single- or double-spaced, using the standard 250-words-per-double-spaced-page manuscript estimate.',
      faq: [
        { question: 'How many pages is 1,000 words?', answer: 'About 4 pages double-spaced (1,000 ÷ 250) or 2 pages single-spaced (1,000 ÷ 500), using the standard manuscript-formatting estimate.' },
        { question: 'How many words is a 5-page paper?', answer: 'About 1,250 words double-spaced (5 × 250) or 2,500 words single-spaced (5 × 500).' },
        { question: 'Where does the 250-words-per-page figure come from?', answer: 'It is the standard manuscript-format estimate: with margins set for about 25 lines per page and roughly 10 words per line, an editor can count about 250 words per double-spaced page.' },
        { question: 'Why is single-spaced exactly double the double-spaced estimate?', answer: 'Because single-spacing roughly doubles how many lines fit on a page (about 50 instead of 25), the words-per-page estimate for single-spacing is modeled as double the double-spaced figure, not a separately measured number.' },
        { question: 'Will my actual document match this estimate exactly?', answer: 'Not exactly. Font, font size, margins, headings, images and block quotes all change how many words fit per page. This is a planning estimate, not a substitute for checking your word processor\'s own page count.' },
        { question: 'Does this work for single-spaced documents too?', answer: 'Yes — choose single-spaced, or just read the "pages at the other spacing" figure, which always shows the comparison for whichever spacing you did not select.' }
      ]
    },
    compute(values) {
      const wordsPerPage = values.spacing === 1 ? 500 : 250;
      const otherWordsPerPage = values.spacing === 1 ? 250 : 500;
      const pages = values.words / wordsPerPage;
      const otherSpacingPages = values.words / otherWordsPerPage;
      return { pages, otherSpacingPages };
    }
  },
  // Custom-component stub: rendered by a special component in page.tsx (TextToolsCalculator, mode="word").
  {
    id: 'word-counter-calculator',
    category: 'text',
    group: 'Word Count & Readability',
    glyph: 'Wd',
    updatedAt: '2026-11-18',
    aliases: ['word count tool', 'essay word counter', 'online word counter', 'blog post word counter', 'word counting tool'],
    related: ['character-counter', 'readability-score-calculator', 'word-to-page-count-calculator'],
    title: 'Word Counter',
    description: 'Count words first, plus characters, sentences and paragraphs, with an estimated reading time — built around hitting a word-count target, not a character limit.',
    example: 'A 320-word blog intro takes about 1.6 minutes to read at 200 words per minute, shown here rounded up to "2 min."',
    inputs: [],
    content: {
      lastReviewed: '2026-11-18',
      concept: {
        title: 'Word counter vs. character counter: what is actually different',
        paragraphs: [
          'This page counts words, characters, sentences and paragraphs with exactly the same counting rules as the character counter on this site, so the figures will always match for the same text. What is different is which number leads and what the page is built around: a word-count target — a 500-word assignment, a 1,000-word article brief, a freelance word-count minimum — rather than a character limit.',
          'Word counts, not character counts, are how most writing is actually assigned and measured: school essays, journalism and content briefs are set in words far more often than characters. This page skips the character counter\'s social-platform limit bars entirely and puts the word count front and center instead, since a character limit is rarely the thing you are writing toward when a word count is the target.',
          'Once you have a word count, it is a useful starting point elsewhere on this site: the readability score calculator turns a word, sentence and syllable count into a difficulty score, and the word-to-page-count calculator turns it into an estimated page count.'
        ]
      },
      howTo: {
        intro: 'Type or paste your text into the box.',
        steps: [
          { name: 'Enter your text', text: 'Type directly or paste from anywhere — a draft essay, an article, a caption.' },
          { name: 'Read your word count', text: 'The word count is shown first and largest. Characters, sentences and paragraphs follow below it.' },
          { name: 'Check the reading time', text: 'A rough estimate at 200 words per minute, the same commonly used average this site\'s character counter uses for silent reading of online text.' },
          { name: 'Write toward your target', text: 'Keep the box open while you draft, and watch the word count move toward your assignment or brief\'s target.' },
          { name: 'Switch tools if you need more', text: 'Use the mode toggle to switch to the character counter\'s platform-limit bars, the hashtag counter, or the syllable counter.' }
        ],
        outro: 'Everything runs in your browser as you type. Nothing is uploaded, sent, or stored.'
      },
      formula: {
        intro: 'Each count is the same simple, well-defined rule the character counter uses.',
        expression:
          'words = the text split on runs of whitespace\ncharacters = length of the text, spaces included\nsentences = the number of . ! or ? runs\nparagraphs = the text split on blank lines',
        terms: [
          { symbol: 'words', meaning: 'Counted by splitting on whitespace, so "well-known" is one word and multiple spaces between words do not create extra ones.' },
          { symbol: 'sentences', meaning: 'Counted by runs of sentence-ending punctuation (., !, ?) — an approximation, not true grammatical parsing.' },
          { symbol: 'paragraphs', meaning: 'Counted by blank lines, so a single line break alone does not start a new paragraph.' }
        ],
        note: 'A word-count target set by an assignment, brief or publication is usually an approximate guide, not an exact figure you must hit precisely — check the specific instructions you were given.'
      },
      workedExample: {
        intro: 'A short two-paragraph sample: "Daily Calculations helps you plan budgets, track fitness, and convert units. Try it today! It is free and works entirely in your browser." followed by a blank line and "Use this word counter whenever you need an exact count instead of a character limit."',
        rows: [
          { label: 'Words', value: '38' },
          { label: 'Characters (with spaces)', value: '223' },
          { label: 'Sentences', value: '4' },
          { label: 'Paragraphs', value: '2' },
          { label: 'Reading time (38 words ÷ 200/min)', value: '11 seconds' }
        ],
        result: '38 words · 223 characters · 11-second read',
        explanation: 'At 38 words and 223 characters, this short sample is already a useful size check: a word-count-based brief would judge it by the 38, while a character-limited field (like a meta description or a social caption) would judge the same text by the 223 — two different numbers from the same text, which is exactly why this page leads with words instead.'
      },
      watchOut: [
        { title: 'Same counts as the character counter, different emphasis', body: 'The word, character, sentence and paragraph counts are identical to the character counter\'s — this page does not count differently, it just leads with words and drops the platform character-limit bars.' },
        { title: 'Sentence counting is approximate', body: 'Counting runs of . ! and ? misses sentences that do not end in standard punctuation and can over- or under-count abbreviations ("Dr. Smith") or ellipses ("wait...") compared to true grammatical sentence parsing.' },
        { title: 'A word-count target is usually a guide, not an exact figure', body: 'Most assignments, briefs and style guides treat a stated word count as approximate ("around 500 words" or "500-600 words") rather than a number you must match exactly — check your specific instructions.' },
        { title: 'Reading time is a rough average', body: 'The 200-words-per-minute estimate is a commonly used average for silent reading of online text, not a prediction for any individual reader\'s actual speed.' },
        { title: 'Hyphenated and compound words count once', body: 'Splitting on whitespace means "well-known" or "twenty-one" each count as a single word, matching how most word-count tools and word processors count them.' }
      ],
      references: [
        { label: 'Wikipedia, Word count', url: 'https://en.wikipedia.org/wiki/Word_count' }
      ]
    },
    seo: {
      title: 'Word Counter – Free Online Word Count Tool',
      description: 'Count words first, plus characters, sentences and paragraphs, with an estimated reading time. Built for hitting a word-count target. Free, instant.',
      faq: [
        { question: 'How many words should my essay or article be?', answer: 'That depends entirely on your specific assignment, brief or publication — there is no universal word-count rule. Most state a target as approximate ("around 500 words"), so check your own instructions.' },
        { question: 'Does this count words the same way as Microsoft Word or Google Docs?', answer: 'Very closely. Like most word processors, this counts runs of whitespace-separated text as words, so hyphenated words like "well-known" count once. Minor differences can occur around footnotes, headers or special characters.' },
        { question: 'Why does a hyphenated word only count as one word?', answer: 'Because it contains no whitespace to split on — "twenty-one" is one unbroken run of characters, the same way most word counters and word processors treat it.' },
        { question: 'How is reading time calculated?', answer: 'Reading time is estimated at 200 words per minute, a commonly used average for silent reading of online text, shown as a rough guide rather than a precise prediction.' },
        { question: 'What is the difference between this and the character counter?', answer: 'The underlying counts are identical. This page leads with the word count and drops the character counter\'s social-platform character-limit bars, since a word-count target rather than a character limit is usually what you are writing toward here.' },
        { question: 'Can I count words in a document I paste from elsewhere?', answer: 'Yes — paste text from any source. Everything runs in your browser, and nothing you paste is uploaded, sent, or stored.' }
      ]
    },
    compute() { return {}; }
  },
];
