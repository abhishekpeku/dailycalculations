import type { CalculatorConfig } from './types.ts';

export const creatorCalculators: CalculatorConfig[] = [
  {
    id: 'youtube-earnings-calculator',
    category: 'creator',
    updatedAt: '2026-09-10',
    aliases: ['youtube money calculator', 'cpm revenue calculator', 'adsense earnings estimator', 'rpm calculator'],
    related: ['instagram-engagement-calculator', 'hashtag-counter', 'character-counter', 'freelancer-rate-calculator'],
    title: 'YouTube Earnings Estimator',
    description: 'Estimate monthly and annual YouTube ad revenue based on views, RPM, and content niche.',
    example: 'Estimate earnings for a channel with 500,000 monthly views and $4 RPM.',
    inputs: [
      { id: 'monthlyViews', label: 'Monthly video views', type: 'number', placeholder: '500000', defaultValue: 500000, step: 10000, min: 0 },
      { id: 'rpm', label: 'Revenue per 1,000 views (RPM $)', type: 'currency', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'ctr', label: 'Ad click-through rate (%)', type: 'percent', placeholder: '1.5', defaultValue: 1.5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'YouTube Earnings Estimator – Ad Revenue Calculator',
      description: 'Estimate YouTube AdSense revenue based on views and RPM. Understand what factors affect earnings in different content niches.',
      faq: [
        { question: 'What is YouTube RPM?', answer: 'RPM (Revenue Per Mille) is how much a creator earns per 1,000 views after YouTube takes its 45% cut. Finance and tech channels earn $8–$20+ RPM; entertainment is $1–$4.' },
        { question: 'How many views do you need to make money on YouTube?', answer: 'You need 1,000 subscribers and 4,000 watch hours in 12 months to join the YouTube Partner Program. At $3–$5 RPM, 100,000 views/month earns roughly $300–$500.' },
        { question: 'What percentage does YouTube take?', answer: 'YouTube keeps 45% of ad revenue and pays creators 55%. RPM already reflects the creator\'s 55% share.' }
      ]
    },
    compute(values) {
      const monthlyEarnings = (values.monthlyViews / 1000) * values.rpm;
      const annualEarnings = monthlyEarnings * 12;
      const estimatedClicks = values.monthlyViews * (values.ctr / 100);
      return { monthlyEarnings, annualEarnings, estimatedClicks };
    }
  },
  {
    id: 'instagram-engagement-calculator',
    category: 'creator',
    updatedAt: '2026-09-10',
    aliases: ['engagement rate calculator', 'social media engagement calculator', 'influencer rate calculator'],
    related: ['youtube-earnings-calculator', 'hashtag-counter', 'character-counter', 'freelancer-rate-calculator'],
    title: 'Instagram Engagement Calculator',
    description: 'Calculate engagement rate for Instagram posts and estimate sponsored post value based on follower count and engagement.',
    example: 'Calculate engagement rate for an account with 50,000 followers and an average of 1,200 likes and 80 comments per post.',
    inputs: [
      { id: 'followers', label: 'Follower count', type: 'number', placeholder: '50000', defaultValue: 50000, step: 1000, min: 100 },
      { id: 'avgLikes', label: 'Average likes per post', type: 'number', placeholder: '1200', defaultValue: 1200, step: 50, min: 0 },
      { id: 'avgComments', label: 'Average comments per post', type: 'number', placeholder: '80', defaultValue: 80, step: 5, min: 0 },
      { id: 'avgShares', label: 'Average saves / shares per post', type: 'number', placeholder: '40', defaultValue: 40, step: 5, min: 0 }
    ],
    seo: {
      title: 'Instagram Engagement Rate Calculator',
      description: 'Calculate Instagram engagement rate and estimate sponsored post value. Understand what constitutes good engagement for influencer marketing.',
      faq: [
        { question: 'What is a good Instagram engagement rate?', answer: 'Average engagement is 1–3%. Nano-influencers (1k–10k followers) often see 4–8%. Mega-influencers (1M+) typically see under 1.5%.' },
        { question: 'How is sponsored post value estimated?', answer: 'A common rule of thumb is $100 per 10,000 followers as a baseline, adjusted upward for high engagement rates. CPM-based pricing ranges from $5–$25 per 1,000 followers depending on niche.' },
        { question: 'What counts as engagement?', answer: 'Likes, comments, shares, and saves all count. Comments and saves are weighted more heavily by the Instagram algorithm as they indicate deeper interest.' }
      ]
    },
    compute(values) {
      const totalEngagement = values.avgLikes + values.avgComments + values.avgShares;
      const engagementRate = values.followers > 0 ? (totalEngagement / values.followers) * 100 : 0;
      const estimatedPostValue = (values.followers / 10000) * 100 * (engagementRate > 3 ? 1.5 : 1);
      const cpm = values.followers > 0 ? (estimatedPostValue / values.followers) * 1000 : 0;
      return { totalEngagement, engagementRate, estimatedPostValue, cpm };
    }
  }
];
