import type { CalculatorConfig } from './types.ts';

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
  }
];
