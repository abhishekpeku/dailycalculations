import type { CalculatorConfig } from './types.ts';

export const textCalculators: CalculatorConfig[] = [
  // Custom-component stub: rendered by a special component in page.tsx.
  {
    id: 'character-counter',
    category: 'text',
    updatedAt: '2026-09-10',
    aliases: ['letter counter', 'text length calculator', 'twitter character counter', 'character count tool'],
    related: ['hashtag-counter', 'instagram-engagement-calculator', 'youtube-earnings-calculator'],
    redirectFrom: ['word-counter'],
    title: 'Character Counter',
    description: 'Count characters, words, sentences, and paragraphs. See how your text fits within platform limits for Twitter/X, Instagram, LinkedIn, and more.',
    example: 'Check if a tweet fits within the 280-character Twitter/X limit.',
    inputs: [],
    seo: {
      title: 'Character Counter – Words, Sentences, Platform Limits',
      description: 'Count characters, words, sentences, and paragraphs in your text. Instantly see platform limits for Twitter/X (280), Instagram (2200), LinkedIn (3000), and more.',
      faq: [
        { question: 'What is the Twitter character limit?', answer: 'Twitter/X allows 280 characters per tweet for standard accounts. URLs are counted as 23 characters regardless of length.' },
        { question: 'What is the Instagram caption limit?', answer: 'Instagram captions can be up to 2,200 characters, but only the first 125 characters show before the "more" cutoff in feed.' },
        { question: 'How is reading time calculated?', answer: 'Reading time is estimated at 200 words per minute, which is average for online content reading.' }
      ]
    },
    compute() { return {}; }
  },
  // Custom-component stub: rendered by a special component in page.tsx.
  {
    id: 'hashtag-counter',
    category: 'text',
    updatedAt: '2026-09-10',
    aliases: ['hashtag limit checker', 'instagram hashtag counter', 'tag counter'],
    related: ['character-counter', 'instagram-engagement-calculator', 'youtube-earnings-calculator'],
    title: 'Hashtag Counter',
    description: 'Count and extract unique hashtags from your caption or post. Check Instagram\'s 30-hashtag limit and see all tags at a glance.',
    example: 'Count hashtags in an Instagram caption and verify you are within the 30-hashtag limit.',
    inputs: [],
    seo: {
      title: 'Hashtag Counter – Instagram and Social Media Hashtag Tool',
      description: 'Count unique hashtags in your post caption. Checks Instagram\'s 30-hashtag limit and lists all detected tags. Works for Instagram, TikTok, and Twitter.',
      faq: [
        { question: 'How many hashtags should I use on Instagram?', answer: 'Instagram allows up to 30 hashtags per post. Research suggests 3–11 highly relevant hashtags often outperform maxing out the limit with irrelevant tags.' },
        { question: 'Do hashtags work on all platforms?', answer: 'Hashtags work on Instagram, TikTok, Twitter/X, LinkedIn, and Facebook. Pinterest and YouTube also support them. They have no effect on WhatsApp or Messenger.' }
      ]
    },
    compute() { return {}; }
  }
];
