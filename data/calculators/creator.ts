import type { CalculatorConfig } from './types.ts';

export const creatorCalculators: CalculatorConfig[] = [
  {
    id: 'youtube-earnings-calculator',
    category: 'creator',
    updatedAt: '2026-10-21',
    aliases: ['youtube money calculator', 'cpm revenue calculator', 'adsense earnings estimator', 'rpm calculator'],
    related: ['instagram-engagement-calculator', 'hashtag-counter', 'character-counter', 'freelancer-rate-calculator'],
    title: 'YouTube Earnings Estimator',
    description: 'Estimate monthly and annual YouTube ad revenue from views and an RPM you provide — your own assumption, not a published average — and solve backward from a target income to the views or RPM it needs.',
    example: 'At 500,000 monthly views and an assumed $4.00 RPM, estimated earnings are $2,000/month ($24,000/year projected) — the $4.00 is an illustrative input you supply, not a typical or official figure.',
    solver: {
      defaultTarget: 'monthlyEarnings',
      variables: [
        { id: 'monthlyEarnings', label: 'Estimated monthly earnings', symbol: 'E', dimension: 'currency', defaultValue: 2000, defaultUnit: 'currency' },
        { id: 'monthlyViews', label: 'Monthly video views', symbol: 'V', dimension: 'count', defaultValue: 500000, defaultUnit: 'count' },
        { id: 'rpm', label: 'Assumed RPM (revenue per 1,000 views)', symbol: 'RPM', dimension: 'currency', defaultValue: 4, defaultUnit: 'currency' },
        { id: 'ctr', label: 'Assumed ad click-through rate', symbol: 'CTR', dimension: 'percent', defaultValue: 1.5, defaultUnit: '%', fixed: true }
      ],
      solve: {
        monthlyEarnings: ({ monthlyViews, rpm }) => (monthlyViews / 1000) * rpm,
        monthlyViews: ({ monthlyEarnings, rpm }) => (rpm > 0 ? (monthlyEarnings / rpm) * 1000 : NaN),
        rpm: ({ monthlyEarnings, monthlyViews }) => (monthlyViews > 0 ? (monthlyEarnings / monthlyViews) * 1000 : NaN)
      },
      outputs: [
        { id: 'annualEarnings', label: 'Projected annual earnings (× 12)', dimension: 'currency', compute: (si) => ((si.monthlyViews / 1000) * si.rpm) * 12 },
        { id: 'estimatedClicks', label: 'Estimated ad clicks per month', dimension: 'count', compute: (si) => si.monthlyViews * (si.ctr / 100) }
      ],
      visuals: [{ type: 'compareBars', bars: [{ from: 'monthlyEarnings', label: 'Per month' }, { from: 'annualEarnings', label: 'Projected per year' }], title: 'Monthly vs. projected annual earnings' }]
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What RPM means, and why it is an input you provide, not a fact',
        paragraphs: [
          'RPM (revenue per mille, or revenue per 1,000 views) is how creators usually talk about YouTube ad earnings: total estimated revenue divided by views, in thousands. It already reflects the creator\'s share of ad revenue, which is why it is simpler to work with than the advertiser-side CPM figure. Once you know an RPM, monthly earnings are a short multiplication: views divided by 1,000, times RPM.',
          'The part that is genuinely hard — and that this calculator does not try to solve — is knowing what RPM to use. It depends on content niche, audience country, season, which ad formats are enabled, and overall ad-market conditions, and it moves over time. YouTube does not publish fixed RPM figures by category or niche; a creator\'s actual RPM is only visible inside their own YouTube Studio Analytics once their channel is monetized. Every RPM value on this page, including the $4.00 default, is an assumption you are testing, not a looked-up or typical figure — replace it with your own channel\'s real number for anything beyond a rough what-if.',
          'Earning anything at all also requires meeting YouTube\'s monetization eligibility first, and even then YouTube keeps a share of ad revenue rather than passing all of it to the creator — both are official, documented policies, covered in the formula section below.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of estimated monthly earnings, monthly views and RPM. The third, marked auto, is calculated. Click-through rate is a separate, independent figure.',
        steps: [
          { name: 'Enter your monthly views', text: 'Total views across the videos you are estimating for in a typical month.' },
          { name: 'Enter an RPM to test', text: 'Use your own channel\'s actual RPM from YouTube Studio Analytics if you have it. Otherwise, treat any number here as a placeholder assumption, not a fact.' },
          { name: 'Read the estimated earnings', text: 'Monthly earnings are the headline; the projected annual figure simply multiplies by 12 and assumes the same views and RPM hold steady, which real channels rarely do exactly.' },
          { name: 'Or work backward', text: 'Type a target monthly earnings figure and leave views or RPM alone to see what combination would be needed to reach it.' },
          { name: 'Check estimated clicks', text: 'A separate, independent estimate from your assumed click-through rate, not part of the earnings calculation itself.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Earnings are views times RPM, scaled by 1,000. Monetization eligibility and YouTube\'s revenue share are fixed, documented policies, not part of the arithmetic.',
        expression: 'monthlyEarnings = (monthlyViews ÷ 1,000) × RPM\nannualEarnings = monthlyEarnings × 12\nestimatedClicks = monthlyViews × (CTR ÷ 100)',
        terms: [
          { symbol: 'RPM', meaning: 'An assumption you supply — not a published or typical figure. Find your own channel\'s actual RPM in YouTube Studio Analytics once monetized.' },
          { symbol: 'CTR', meaning: 'Assumed ad click-through rate, used only for the separate estimated-clicks figure; it does not feed into the earnings formula.' }
        ],
        note: 'This is a what-if calculation based on an RPM you choose, not an income guarantee or an official YouTube estimate. YouTube requires 1,000 subscribers and 4,000 public watch hours in the past 12 months (or an alternate Shorts-views path) before a channel can earn ad revenue at all, and pays monetizing creators 55% of ad revenue on standard long-form ad formats, keeping 45% — both are YouTube\'s own published policies, not assumptions this calculator makes.'
      },
      workedExample: {
        intro: 'A channel gets 500,000 views in a month. Testing an assumed RPM of $4.00 and an assumed 1.5% ad click-through rate — both illustrative inputs, not typical figures — what does that suggest?',
        rows: [
          { label: 'Monthly earnings (500,000 ÷ 1,000 × $4.00)', value: '$2,000.00' },
          { label: 'Projected annual earnings (2,000 × 12)', value: '$24,000.00' },
          { label: 'Estimated ad clicks (500,000 × 1.5%)', value: '7,500' }
        ],
        result: 'At this assumed $4.00 RPM: $2,000.00/month, $24,000.00/year projected',
        explanation: 'Every figure here moves proportionally with the assumed RPM: testing $2.00 instead of $4.00 would halve both earnings figures to $1,000.00/month and $12,000.00/year, with the estimated clicks unchanged since that figure depends only on views and the separate CTR assumption.'
      },
      watchOut: [
        { title: 'RPM is your assumption, never a guaranteed or typical figure', body: 'YouTube does not publish RPM figures by niche or category. Lists of "typical RPM by niche" you may find elsewhere are not official YouTube data and can be outdated or unreliable — your own YouTube Studio Analytics is the only authoritative source for your channel\'s real RPM.' },
        { title: 'Monetization has eligibility requirements', body: 'A channel needs 1,000 subscribers and 4,000 valid public watch hours in the past 12 months, or an alternate path based on Shorts views, before it can run ads at all — regardless of what this calculator estimates.' },
        { title: 'The revenue share differs for Shorts', body: 'The 55% creator / 45% YouTube split applies to standard ad formats on long-form video. YouTube Shorts uses a different revenue model through a separate creator pool.' },
        { title: 'Views and RPM both change constantly', body: 'A single month\'s numbers are a snapshot. Seasonal ad demand, algorithm changes, and shifts in audience geography can all move RPM independent of anything a creator does differently.' },
        { title: 'Ad revenue is often not a creator\'s only income', body: 'Channel memberships, Super Chat, sponsorships and merchandise are separate from ad revenue and are not modeled by this calculator at all.' }
      ],
      references: [
        { label: 'YouTube Help, Eligibility requirements for monetization', url: 'https://support.google.com/youtube/answer/72851' },
        { label: 'YouTube Blog (official), YouTube Partner Program, Explained', url: 'https://blog.youtube/creator-and-artist-stories/youtube-partner-program-explained/' }
      ]
    },
    inputs: [
      { id: 'monthlyViews', label: 'Monthly video views', type: 'number', placeholder: '500000', defaultValue: 500000, step: 10000, min: 0 },
      { id: 'rpm', label: 'Revenue per 1,000 views (RPM $)', type: 'currency', placeholder: '4', defaultValue: 4, step: 0.5, min: 0 },
      { id: 'ctr', label: 'Ad click-through rate (%)', type: 'percent', placeholder: '1.5', defaultValue: 1.5, step: 0.1, min: 0 }
    ],
    seo: {
      title: 'YouTube Earnings Estimator – What-If RPM Calculator',
      description: 'Estimate YouTube ad revenue from views and an RPM you choose to test — not a published average. Solve backward from a target income to the views or RPM it needs.',
      faq: [
        { question: 'What is YouTube RPM?', answer: 'RPM (revenue per mille) is estimated revenue per 1,000 views, already reflecting the creator\'s share after YouTube\'s cut. It is different from CPM, which is what advertisers pay before any revenue split.' },
        { question: 'Is the RPM on this page an official or average figure?', answer: 'No. It is a placeholder you can change to test different scenarios. YouTube does not publish RPM figures by niche or category — your own YouTube Studio Analytics is the only authoritative source for your channel\'s actual RPM.' },
        { question: 'How many subscribers and views do I need to earn money on YouTube?', answer: 'YouTube\'s published eligibility requirement is 1,000 subscribers with 4,000 valid public watch hours in the past 12 months, or 1,000 subscribers with 10 million public Shorts views in the past 90 days.' },
        { question: 'What percentage does YouTube take?', answer: 'YouTube\'s own published split pays creators 55% of ad revenue on standard long-form ad formats and keeps 45%; the Shorts revenue model works differently.' },
        { question: 'How is monthly and annual YouTube revenue calculated here?', answer: 'Monthly earnings are views ÷ 1,000 × RPM. Annual is that figure × 12. At 500,000 monthly views and an assumed $4.00 RPM, that is $2,000/month and a projected $24,000/year.' },
        { question: 'What does the estimated ad clicks figure show?', answer: 'Monthly views times an assumed click-through rate, calculated independently of the earnings figures — it does not feed into the RPM-based revenue estimate.' },
        { question: 'Where can I find my channel\'s actual RPM?', answer: 'In YouTube Studio, under Analytics > Revenue, once your channel is approved for monetization. That real figure will always be more accurate than any assumption entered here.' }
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
    updatedAt: '2026-10-21',
    aliases: ['engagement rate calculator', 'social media engagement calculator', 'influencer rate calculator'],
    related: ['youtube-earnings-calculator', 'hashtag-counter', 'character-counter', 'freelancer-rate-calculator'],
    title: 'Instagram Engagement Calculator',
    description: 'Calculate Instagram engagement rate from your own follower count, likes, comments and saves/shares, with a composition breakdown and an illustrative (not market-sourced) sponsored-post value formula.',
    example: 'An account with 50,000 followers averaging 1,200 likes, 80 comments and 40 saves/shares per post has a 2.64% engagement rate — compare this to your own account\'s history, since Instagram publishes no official "good rate" benchmark.',
    breakdown: {
      headline: 'engagementRate',
      headlineLabel: 'Engagement rate',
      outputs: [
        { id: 'engagementRate', label: 'Engagement rate', format: 'percent' },
        { id: 'totalEngagement', label: 'Total engagement per post', format: 'integer' },
        { id: 'estimatedPostValue', label: 'Illustrative sponsored post value (this page\'s own formula)', format: 'currency' },
        { id: 'cpm', label: 'Implied rate per 1,000 followers', format: 'currency' }
      ],
      groups: [
        { title: 'Your account', inputs: ['followers'] },
        { title: 'Average per post', inputs: ['avgLikes', 'avgComments', 'avgShares'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'avgLikes', label: 'Likes' },
          { from: 'avgComments', label: 'Comments' },
          { from: 'avgShares', label: 'Saves / shares' }
        ],
        center: 'totalEngagement',
        centerSub: 'total engagement per post'
      }
    },
    content: {
      lastReviewed: '2026-10-21',
      concept: {
        title: 'What engagement rate measures, and what it does not',
        paragraphs: [
          'Engagement rate is total engagement on a post divided by follower count. Instagram\'s own creator guidance counts likes, comments, saves and shares as engagement; Meta\'s developer API, by contrast, defines the "engagement" metric for a media object more narrowly, as likes plus comments only, in some contexts. Different tools can report different numbers for the same post for exactly this reason — there is no single universal formula, only the one each tool documents.',
          'What counts as a "good" engagement rate varies enormously by content format (Reels tend to behave differently from static photos), niche, audience size and region, and it changes as the platform\'s algorithm changes. Instagram does not publish an official benchmark rate, so this page does not assert one either — the most meaningful comparison is your own account\'s rate over time, or against accounts genuinely similar to yours in size and niche, not a generic industry figure.',
          'The sponsored-post value shown is a simple built-in formula ($100 per 10,000 followers, increased for a higher engagement rate) meant only to illustrate how a back-of-envelope estimate might work. It is not a market rate published by Instagram, Meta, or any other authority — real sponsorship pricing is negotiated individually and depends on format, exclusivity, usage rights and many factors this calculator has no way to know.'
        ]
      },
      howTo: {
        intro: 'Enter your follower count and your typical likes, comments and saves/shares per post.',
        steps: [
          { name: 'Enter your follower count', text: 'Your current total followers.' },
          { name: 'Enter average likes, comments, and saves/shares', text: 'Use a realistic average across several recent posts rather than your single best-performing one.' },
          { name: 'Read your engagement rate', text: 'The headline is total engagement divided by followers, as a percentage.' },
          { name: 'Check the composition', text: 'The donut shows how your engagement splits between likes, comments and saves/shares — a mix skewed toward saves or comments can matter more to the algorithm than raw like counts.' },
          { name: 'Treat the post-value figure as a rough starting point only', text: 'It uses a simple illustrative formula, not a published market rate — see the formula section for exactly what it assumes.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Engagement rate is a straightforward ratio. The post-value figure is a simplified placeholder, not a sourced formula.',
        expression:
          'totalEngagement = avgLikes + avgComments + avgShares\nengagementRate = totalEngagement ÷ followers × 100\nestimatedPostValue = (followers ÷ 10,000) × $100 × (1.5 if engagementRate > 3%, else 1)\ncpm = estimatedPostValue ÷ followers × 1,000',
        terms: [
          { symbol: 'engagementRate', meaning: 'Total engagement as a percentage of followers — the figure this calculator treats as the headline, since it has a clear, consistent definition.' },
          { symbol: 'estimatedPostValue', meaning: 'This page\'s own illustrative formula, not a published rate. A flat $100 per 10,000 followers, multiplied by 1.5 if the engagement rate is above 3%.' }
        ],
        note: 'Neither Instagram nor Meta publishes a formula or benchmark for sponsored-post pricing or a "good" engagement rate. The post-value figure here is a simple placeholder for illustration, not a market-sourced or official rate — real deal pricing is negotiated individually.'
      },
      workedExample: {
        intro: 'An account with 50,000 followers averages 1,200 likes, 80 comments and 40 saves/shares per post.',
        rows: [
          { label: 'Total engagement (1,200 + 80 + 40)', value: '1,320' },
          { label: 'Engagement rate (1,320 ÷ 50,000 × 100)', value: '2.64%' },
          { label: 'Post-value multiplier (2.64% is not above 3%)', value: '1×' },
          { label: 'Illustrative post value (50,000 ÷ 10,000 × $100 × 1)', value: '$500.00' },
          { label: 'Implied rate per 1,000 followers (500 ÷ 50,000 × 1,000)', value: '$10.00' }
        ],
        result: 'Engagement rate 2.64% · illustrative post value $500.00 (this page\'s own formula, not a market rate)',
        explanation: 'Because 2.64% does not clear the built-in 3% threshold, the illustrative post value uses the base multiplier rather than the higher one. At exactly the same follower count but an engagement rate above 3% — say 1,600 likes instead of 1,200 (bringing total engagement to 1,720, or 3.44%) — the illustrative value would jump to $750.00 as the 1.5× multiplier kicks in, a model behavior worth understanding even though the dollar figure itself is not a sourced market rate.'
      },
      watchOut: [
        { title: 'There is no official "good" engagement rate', body: 'Instagram does not publish a benchmark figure, and rates vary enormously by format, niche, audience size and region. Track your own account\'s trend over time rather than comparing to an unsourced number from elsewhere.' },
        { title: 'The sponsored-post value is illustrative, not a market rate', body: 'It is a simple formula built into this page, not a rate published or endorsed by Instagram, Meta, or any industry body. Real sponsorship pricing is negotiated individually and can differ substantially in either direction.' },
        { title: 'Different tools define "engagement" differently', body: 'Instagram\'s own creator guidance counts likes, comments, saves and shares. Meta\'s developer API defines the "engagement" metric for a post more narrowly in some contexts. Numbers from different sources are not always directly comparable.' },
        { title: 'The denominator matters', body: 'This calculator divides by followers. Some tools divide by "reach" (unique accounts that saw the post) instead, which usually produces a different, often higher, percentage for the same post.' },
        { title: 'Follower count alone can mislead', body: 'Purchased or bot followers inflate the denominator without adding real engagement, which silently lowers the rate — a sudden follower spike with flat engagement is a common sign of this.' }
      ],
      references: [
        { label: 'Instagram for Creators, Create Engaging Content', url: 'https://creators.instagram.com/create-engaging-content' },
        { label: 'Meta for Developers, Instagram Platform Insights', url: 'https://developers.facebook.com/docs/instagram-platform/insights/' }
      ]
    },
    inputs: [
      { id: 'followers', label: 'Follower count', type: 'number', placeholder: '50000', defaultValue: 50000, step: 1000, min: 100 },
      { id: 'avgLikes', label: 'Average likes per post', type: 'number', placeholder: '1200', defaultValue: 1200, step: 50, min: 0 },
      { id: 'avgComments', label: 'Average comments per post', type: 'number', placeholder: '80', defaultValue: 80, step: 5, min: 0 },
      { id: 'avgShares', label: 'Average saves / shares per post', type: 'number', placeholder: '40', defaultValue: 40, step: 5, min: 0 }
    ],
    seo: {
      title: 'Instagram Engagement Rate Calculator',
      description: 'Calculate your Instagram engagement rate from your own numbers, with a composition breakdown. No invented industry benchmarks — compare your own account over time.',
      faq: [
        { question: 'How is Instagram engagement rate calculated?', answer: 'Add likes, comments and saves/shares per post, divide by follower count, and multiply by 100. 1,200 likes + 80 comments + 40 saves/shares, divided by 50,000 followers, is a 2.64% engagement rate.' },
        { question: 'What counts as "engagement" on Instagram?', answer: 'Instagram\'s own creator guidance counts likes, comments, saves and shares. Meta\'s developer-facing API defines the "engagement" metric for a post more narrowly as likes plus comments in some contexts, so figures from different tools are not always directly comparable.' },
        { question: 'What is a good Instagram engagement rate?', answer: 'There is no official benchmark published by Instagram or Meta. Rates vary enormously by format, niche, audience size and region — comparing your own account\'s rate over time is more reliable than any generic industry figure.' },
        { question: 'How is the estimated sponsored post value calculated?', answer: 'This page uses its own simple illustrative formula — roughly $100 per 10,000 followers, increased for a higher engagement rate — not a rate published by Instagram, Meta, or any industry body. Real sponsorship pricing is negotiated individually.' },
        { question: 'Why might my engagement rate look different in another tool?', answer: 'Two common reasons: the tool may divide by "reach" instead of followers, which changes the denominator, or it may define "engagement" differently (for example, likes and comments only, without saves or shares).' },
        { question: 'Does engagement rate change as an account grows?', answer: 'Engagement rate often trends down as a following grows, though this varies widely by niche and format and Instagram does not publish benchmark figures by account size.' },
        { question: 'What should I do if my engagement rate looks low?', answer: 'Compare it against your own account\'s past posts rather than an outside benchmark, and consider the mix shown in the composition chart — a post with strong saves and comments can be more valuable to the algorithm than one with likes alone.' }
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
