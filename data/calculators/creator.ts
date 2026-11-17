import type { CalculatorConfig } from './types.ts';

export const creatorCalculators: CalculatorConfig[] = [
  {
    id: 'youtube-earnings-calculator',
    category: 'creator',
    group: 'Monetization & Earnings',
    glyph: '$',
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
    group: 'Engagement & Growth',
    glyph: '%',
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
  },
  {
    id: 'tiktok-earnings-calculator',
    category: 'creator',
    group: 'Monetization & Earnings',
    glyph: '¢',
    updatedAt: '2026-11-17',
    aliases: ['tiktok money calculator', 'tiktok creator fund calculator', 'tiktok creator rewards calculator', 'how much does tiktok pay per view', 'tiktok views to dollars calculator'],
    related: ['youtube-earnings-calculator', 'instagram-engagement-calculator', 'freelancer-rate-calculator', 'hashtag-counter'],
    title: 'TikTok Earnings Calculator',
    description: 'Estimate TikTok Creator Fund/Rewards-style earnings from monthly views and a rate you choose to test — TikTok does not publish a fixed rate, so this is a what-if range, not a guarantee.',
    example: 'At 1,000,000 monthly views and a tested $0.03 per 1,000 views, estimated earnings are $30.00/month ($360.00/year projected) — $0.03 sits inside the range individual creators have reported, not an official TikTok figure.',
    breakdown: {
      headline: 'monthlyEarnings',
      headlineLabel: 'Estimated monthly earnings',
      outputs: [
        { id: 'monthlyEarnings', label: 'Estimated monthly earnings', format: 'currency' },
        { id: 'annualEarnings', label: 'Projected annual earnings (× 12)', format: 'currency' }
      ],
      groups: [
        { title: 'Your video views', inputs: ['monthlyViews'] },
        { title: 'Rate to test', inputs: ['ratePerThousandViews'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'monthlyEarnings', label: 'Per month' },
          { from: 'annualEarnings', label: 'Projected per year' }
        ],
        title: 'Monthly vs. projected annual earnings'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'Why TikTok earnings have no single rate to look up',
        paragraphs: [
          'TikTok pays eligible creators through the Creator Rewards Program (which replaced the older Creator Fund), based on "qualified views" of videos over a minute long. Unlike YouTube\'s RPM, TikTok has never published a fixed payout rate per 1,000 views for either program. TikTok\'s own creator guidance states that Creator Rewards payouts are calculated per 1,000 qualified views but vary based on a video\'s originality, watch duration, engagement, and audience location — so two videos with identical view counts can earn very different amounts.',
          'Because no official rate exists, the only real-world numbers available come from individual creators who have shared their own earnings. Reporting on the earlier TikTok Creator Fund found examples working out to roughly $0.02 to $0.04 per 1,000 views, alongside an explicit acknowledgment that "the platform hasn\'t offered a clear explanation of how exactly payouts are calculated." Those figures describe the retired Creator Fund specifically, are anecdotal rather than a published rate, and should not be assumed to carry over unchanged to the current Creator Rewards Program.',
          'This calculator exists to turn "if my rate were X, I\'d earn Y" into arithmetic you can test for yourself. Enter your own monthly views and try different rates — including the low and high ends of what creators have reported — rather than treating any single number here as what TikTok will actually pay.'
        ]
      },
      howTo: {
        intro: 'Enter your monthly qualified views, then a rate per 1,000 views to test.',
        steps: [
          { name: 'Enter your monthly views', text: 'Total qualified views across eligible videos (over one minute long) in a typical month.' },
          { name: 'Choose a rate to test', text: 'The default, $0.03 per 1,000 views, sits inside the range individual creators have reported for the earlier Creator Fund — not a figure TikTok has confirmed or published.' },
          { name: 'Read the estimated earnings', text: 'Monthly earnings are the headline; the projected annual figure simply multiplies by 12 and assumes the same views and rate hold steady.' },
          { name: 'Try the low and high ends', text: 'Re-run the numbers at $0.02 and $0.04 to see the realistic spread this calculator can show you, rather than trusting one point estimate.' },
          { name: 'Check your own dashboard for real figures', text: 'TikTok shows your actual Creator Rewards earnings in the app\'s Creator Tools > Analytics; that number, not this estimate, is what you are actually paid.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Earnings are views times a rate, scaled by 1,000 — the same shape as YouTube\'s RPM math, but with no published rate to anchor the number to.',
        expression: 'monthlyEarnings = (monthlyViews ÷ 1,000) × ratePerThousandViews\nannualEarnings = monthlyEarnings × 12',
        terms: [
          { symbol: 'ratePerThousandViews', meaning: 'An assumption you supply and can change. TikTok does not publish an official rate for either the Creator Fund or Creator Rewards Program.' }
        ],
        note: 'This is a what-if calculation, not an income guarantee or an official TikTok estimate. TikTok\'s Creator Rewards Program pays based on qualified views (videos over one minute), weighted by factors TikTok does not fully disclose — originality, watch duration, engagement, and audience location all affect the real payout, which this simple per-view rate cannot capture.'
      },
      workedExample: {
        intro: 'A creator gets 1,000,000 qualified views in a month. Testing a rate of $0.03 per 1,000 views — within the range individual creators have reported, not an official figure — what does that suggest?',
        rows: [
          { label: 'Monthly earnings (1,000,000 ÷ 1,000 × $0.03)', value: '$30.00' },
          { label: 'Projected annual earnings (30.00 × 12)', value: '$360.00' }
        ],
        result: 'At this tested $0.03 rate: $30.00/month, $360.00/year projected',
        explanation: 'Every figure moves proportionally with the tested rate: at the low end of the reported range, $0.02 per 1,000 views, the same 1,000,000 views would suggest $20.00/month ($240.00/year); at the high end, $0.04, it would suggest $40.00/month ($480.00/year) — more than double the low estimate from the exact same views.'
      },
      watchOut: [
        { title: 'TikTok has never published an official rate', body: 'Every number on this page, including the default, is drawn from creators\' self-reported earnings or set by you — not a figure TikTok has confirmed for either the retired Creator Fund or the current Creator Rewards Program.' },
        { title: 'The Creator Rewards Program replaced the Creator Fund', body: 'TikTok shifted to the Creator Rewards Program, which pays based on qualified views of videos over one minute, factoring in originality and engagement. Reports of $0.02-$0.04 per 1,000 views describe the earlier, retired Creator Fund and may not reflect current payouts.' },
        { title: 'Two videos with the same views can earn very differently', body: 'TikTok\'s own guidance says payouts also depend on originality, watch duration, engagement, and audience location — this calculator only models the views × rate part, not those other factors.' },
        { title: 'Fund/Rewards income is rarely the main income for serious creators', body: 'Brand deals, TikTok LIVE gifts, and off-platform sponsorships are separate from Creator Rewards and are not modeled by this calculator at all.' },
        { title: 'Eligibility has its own requirements', body: 'Creator Rewards Program eligibility requires meeting TikTok\'s own follower, age, and content-policy criteria — regardless of what this calculator estimates, a given account may not qualify to be paid at all.' }
      ],
      references: [
        { label: 'Hootsuite, How the TikTok Creator Fund (and Creator Rewards Program) Works', url: 'https://blog.hootsuite.com/tiktok-creator-fund/' },
        { label: 'Influencer Marketing Hub, How Does the TikTok Creator Fund Work?', url: 'https://influencermarketinghub.com/tiktok-creator-fund/' }
      ]
    },
    inputs: [
      { id: 'monthlyViews', label: 'Monthly qualified views', type: 'number', placeholder: '1000000', defaultValue: 1000000, step: 10000, min: 0 },
      { id: 'ratePerThousandViews', label: 'Rate to test per 1,000 views ($)', type: 'currency', placeholder: '0.03', defaultValue: 0.03, step: 0.01, min: 0 }
    ],
    seo: {
      title: 'TikTok Earnings Calculator – Creator Fund/Rewards Estimate',
      description: 'Estimate TikTok Creator Fund/Rewards earnings from views and a rate you test. TikTok publishes no fixed rate — see the reported range this tool is based on.',
      faq: [
        { question: 'How much does TikTok pay per 1,000 views?', answer: 'TikTok has never published a fixed rate. Individual creators reporting on the earlier Creator Fund described figures working out to roughly $0.02 to $0.04 per 1,000 views; the current Creator Rewards Program pays per 1,000 "qualified views" but also weighs originality, watch duration, engagement, and audience location.' },
        { question: 'What is the TikTok Creator Rewards Program?', answer: 'It is the program that replaced the TikTok Creator Fund. It pays eligible creators based on qualified views of videos over one minute long, factoring in originality, watch duration, engagement, and audience location — TikTok does not publish the exact weighting or a flat per-view rate.' },
        { question: 'Is the rate on this calculator official?', answer: 'No. It is a placeholder based on individual creators\' self-reported figures for the earlier Creator Fund, not a rate TikTok has confirmed. Change it to test different scenarios; your actual payout depends on factors TikTok does not fully disclose.' },
        { question: 'How is estimated TikTok earnings calculated here?', answer: 'Monthly earnings are views ÷ 1,000 × the rate you enter. Annual is that figure × 12. At 1,000,000 monthly views and a tested $0.03 rate, that is $30.00/month and a projected $360.00/year.' },
        { question: 'Where can I see my actual TikTok earnings?', answer: 'In the TikTok app, under Creator Tools > Analytics, once your account is accepted into the Creator Rewards Program. That real figure is always more accurate than any assumption entered here.' },
        { question: 'Does this calculator include TikTok LIVE gifts or brand deals?', answer: 'No. It only models Creator Fund/Rewards-style views-based earnings. LIVE gifts, brand sponsorships, and off-platform income are separate and not included.' }
      ]
    },
    compute(values) {
      const monthlyEarnings = (values.monthlyViews / 1000) * values.ratePerThousandViews;
      const annualEarnings = monthlyEarnings * 12;
      return { monthlyEarnings, annualEarnings };
    }
  },
  {
    id: 'twitch-earnings-calculator',
    category: 'creator',
    group: 'Monetization & Earnings',
    glyph: '◆',
    updatedAt: '2026-11-17',
    aliases: ['twitch money calculator', 'twitch streamer earnings calculator', 'twitch subscriber revenue calculator', 'how much do twitch streamers make', 'twitch bits and subs calculator'],
    related: ['youtube-earnings-calculator', 'tiktok-earnings-calculator', 'patreon-earnings-calculator', 'freelancer-rate-calculator'],
    title: 'Twitch Earnings Calculator',
    description: 'Estimate a Twitch streamer\'s monthly earnings from subscribers, Bits, and ad revenue, using Twitch\'s own published subscription revenue split.',
    example: 'With 500 subscribers at the $4.99 tier on a 50% revenue share, plus $150 in Bits and $100 in ad revenue, estimated monthly earnings are $1,497.50 — $1,247.50 of it from subscriptions alone.',
    breakdown: {
      headline: 'totalEarnings',
      headlineLabel: 'Estimated total monthly earnings',
      outputs: [
        { id: 'totalEarnings', label: 'Estimated total monthly earnings', format: 'currency' },
        { id: 'subRevenue', label: 'Subscription revenue (your share)', format: 'currency' }
      ],
      groups: [
        { title: 'Subscriptions', inputs: ['subscribers', 'subTierPrice', 'subRevenueSharePercent'] },
        { title: 'Bits and ad revenue', inputs: ['bitsRevenue', 'adRevenue'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'subRevenue', label: 'Subscriptions' },
          { from: 'bitsRevenue', label: 'Bits' },
          { from: 'adRevenue', label: 'Ads' }
        ],
        center: 'totalEarnings',
        centerSub: 'total monthly earnings'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'Three separate revenue streams, one Twitch channel',
        paragraphs: [
          'Twitch streamers earn from several independent sources at once: paid subscriptions, Bits (a virtual currency viewers cheer with), and a share of ad revenue shown during the stream. Each has its own math, and Twitch has published real, specific figures for how subscriptions split between Twitch and the streamer — this calculator uses that published structure rather than a guess.',
          'For a standard $4.99 (Tier 1) subscription, Twitch has stated it keeps $2.49 and pays the partnered streamer the remaining $2.50 — a roughly 50/50 split. In September 2022, Twitch introduced a path for some larger partners to keep 70% of their first $100,000 in subscription revenue each year before dropping to 50%; by January 2024, Twitch removed that $100,000 cap and introduced tiered options, including a 60/40 split with lower eligibility requirements alongside continued 70/30 splits for qualifying partners. The exact split any individual streamer gets depends on their specific partner tier and agreement with Twitch.',
          'Bits and ad revenue are real, separate income lines on a streamer\'s own Twitch dashboard, but Twitch does not publish one universal conversion rate from a Bits count or an ad impression to a dollar figure the way it does for the subscription split above. This calculator asks for your Bits revenue and ad revenue as dollar totals you already see in your own Creator Dashboard, rather than estimating them from an unconfirmed per-Bit or per-impression rate.'
        ]
      },
      howTo: {
        intro: 'Enter your subscriber count, the tier price, and your revenue share. Then add your Bits and ad revenue as dollar totals from your own dashboard.',
        steps: [
          { name: 'Enter your subscriber count', text: 'The number of paid subscribers at the tier you are estimating for.' },
          { name: 'Set the tier price', text: 'Twitch\'s standard tiers are priced at $4.99, $9.99, and $24.99; the default here is the $4.99 Tier 1 price.' },
          { name: 'Set your revenue share', text: 'The default 50% matches Twitch\'s published base split ($2.49 of every $4.99 kept by Twitch, $2.50 to the streamer). Raise it to 60% or 70% if your partner agreement qualifies for one of Twitch\'s higher tiers.' },
          { name: 'Enter your Bits revenue', text: 'The dollar total from Bits/cheers this month, from your own Twitch Creator Dashboard — not an estimate from a Bits count, since Twitch does not publish one universal per-Bit payout rate.' },
          { name: 'Enter your ad revenue', text: 'The dollar total from ads shown during your streams this month, again from your own dashboard figures.' },
          { name: 'Read the total and the composition', text: 'The headline is the sum of all three streams; the donut shows how much of it comes from subscriptions versus Bits versus ads.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Subscription revenue is subscribers times the tier price times your revenue share. Bits and ad revenue are added as the dollar totals you already have.',
        expression: 'subRevenue = subscribers × subTierPrice × (subRevenueSharePercent ÷ 100)\ntotalEarnings = subRevenue + bitsRevenue + adRevenue',
        terms: [
          { symbol: 'subRevenueSharePercent', meaning: 'Your cut of each subscription. Twitch\'s published base split is 50% ($2.49 of $4.99 kept by Twitch); some partners qualify for 60% or 70% tiers.' },
          { symbol: 'bitsRevenue / adRevenue', meaning: 'Dollar totals from your own Twitch dashboard, not estimated from a count — Twitch does not publish one universal per-Bit or per-impression rate.' }
        ],
        note: 'This is an estimate from numbers you supply, not a statement of actual payout or a tax calculation. Twitch\'s payout schedule, minimum payout thresholds, and any chargebacks are not modeled here.'
      },
      workedExample: {
        intro: 'A streamer has 500 subscribers at the $4.99 tier, on Twitch\'s published 50% base revenue share, plus $150 in Bits revenue and $100 in ad revenue this month.',
        rows: [
          { label: 'Subscription revenue (500 × $4.99 × 50%)', value: '$1,247.50' },
          { label: 'Plus Bits revenue', value: '$150.00' },
          { label: 'Plus ad revenue', value: '$100.00' },
          { label: 'Total estimated monthly earnings', value: '$1,497.50' }
        ],
        result: 'Estimated total: $1,497.50/month ($1,247.50 from subscriptions)',
        explanation: 'If this same streamer qualified for Twitch\'s 70% partner tier instead of the 50% base split, subscription revenue alone would rise to $1,746.50 (500 × $4.99 × 70%), bringing the total to $1,996.50 — a $499.00 difference driven entirely by the revenue-share percentage, with Bits and ad revenue unchanged.'
      },
      watchOut: [
        { title: 'The subscription split depends on your specific partner tier', body: 'Twitch\'s published figures describe a 50% base split for standard partners, with some partners qualifying for 60% or 70% tiers under specific conditions. Your own Twitch partner agreement is the actual source of truth for your rate, not this calculator\'s default.' },
        { title: 'Bits and ad revenue have no single published conversion rate', body: 'Unlike the subscription split, Twitch has not published one universal dollar rate per Bit or per ad impression in its current help documentation. Enter the dollar totals from your own Creator Dashboard rather than estimating them from a Bits or impression count.' },
        { title: 'Affiliates and Partners are not identical', body: 'Revenue-sharing specifics (including ad revenue eligibility) can differ between Twitch Affiliates and Partners. Confirm your own status and agreement rather than assuming this calculator\'s defaults apply to your account.' },
        { title: 'This does not include donations, sponsorships, or merch', body: 'Many streamers earn significantly through direct viewer donations (outside Twitch\'s own systems), brand sponsorships, and merchandise — none of which are modeled by this calculator.' },
        { title: 'Gift subscriptions and multi-month subscriptions can complicate the count', body: 'A single purchase can cover multiple months or be gifted to other viewers; make sure your subscriber count reflects active, revenue-generating subscriptions for the month you are estimating.' }
      ],
      references: [
        { label: 'Wikipedia, Twitch (service) — Subscriptions and revenue sharing', url: 'https://en.wikipedia.org/wiki/Twitch_(service)' },
        { label: 'Twitch Creator Camp, Learn the Basics: Monetization', url: 'https://www.twitch.tv/creatorcamp/en/learn-the-basics/monetization/' }
      ]
    },
    inputs: [
      { id: 'subscribers', label: 'Subscriber count', type: 'number', placeholder: '500', defaultValue: 500, step: 10, min: 0 },
      { id: 'subTierPrice', label: 'Subscription tier price ($)', type: 'currency', placeholder: '4.99', defaultValue: 4.99, step: 0.01, min: 0 },
      { id: 'subRevenueSharePercent', label: 'Your revenue share (%)', type: 'percent', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'bitsRevenue', label: 'Bits revenue this month ($)', type: 'currency', placeholder: '150', defaultValue: 150, step: 10, min: 0 },
      { id: 'adRevenue', label: 'Ad revenue this month ($)', type: 'currency', placeholder: '100', defaultValue: 100, step: 10, min: 0 }
    ],
    seo: {
      title: 'Twitch Earnings Calculator – Subs, Bits & Ad Revenue',
      description: 'Estimate Twitch streamer earnings from subscribers, Bits, and ad revenue using Twitch\'s own published subscription revenue-share structure.',
      faq: [
        { question: 'What percentage of a Twitch subscription does the streamer keep?', answer: 'Twitch has published that it keeps $2.49 of every standard $4.99 subscription, paying the partnered streamer $2.50 — roughly a 50/50 split. Some partners qualify for higher 60% or 70% tiers under Twitch\'s current structure.' },
        { question: 'How much is a Twitch Bit worth to the streamer?', answer: 'Twitch has not published a single universal dollar rate per Bit in its current help documentation available for this calculator to cite directly. Enter your Bits revenue as a dollar total from your own Creator Dashboard instead of estimating it from a Bits count.' },
        { question: 'How is total Twitch earnings calculated here?', answer: 'Subscription revenue is subscribers × tier price × your revenue share. That is added to your own reported Bits revenue and ad revenue. At 500 subscribers, $4.99, 50% share, $150 Bits and $100 ads, the total is $1,497.50.' },
        { question: 'What is the difference between a Twitch Affiliate and a Partner?', answer: 'Both can earn from subscriptions, Bits, and (subject to eligibility) ads, but specific revenue-sharing terms and eligibility can differ between the two statuses. Check your own current agreement rather than assuming one default applies.' },
        { question: 'Does this calculator include donations or sponsorships?', answer: 'No. It only models subscriptions, Bits, and ad revenue inside Twitch\'s own systems. Direct viewer donations through third-party tools, brand sponsorships, and merchandise sales are separate and not included.' },
        { question: 'Why does the subscription tier price default to $4.99?', answer: 'That is Twitch\'s standard Tier 1 subscription price; Twitch also offers $9.99 (Tier 2) and $24.99 (Tier 3) tiers, which you can enter instead to estimate a channel with higher-tier subscribers.' }
      ]
    },
    compute(values) {
      const subRevenue = values.subscribers * values.subTierPrice * (values.subRevenueSharePercent / 100);
      const totalEarnings = subRevenue + values.bitsRevenue + values.adRevenue;
      return { subRevenue, totalEarnings };
    }
  },
  {
    id: 'podcast-ad-revenue-calculator',
    category: 'creator',
    group: 'Monetization & Earnings',
    glyph: '♫',
    updatedAt: '2026-11-17',
    aliases: ['podcast sponsorship calculator', 'podcast cpm calculator', 'podcast advertising revenue calculator', 'how much do podcast ads pay', 'podcast downloads to dollars calculator'],
    related: ['youtube-earnings-calculator', 'blog-ad-revenue-calculator', 'twitch-earnings-calculator', 'freelancer-rate-calculator'],
    title: 'Podcast Ad Revenue Calculator',
    description: 'Estimate podcast sponsorship revenue from downloads per episode, a CPM rate you choose within typical industry ranges, and the number of ad spots per episode.',
    example: 'At 5,000 downloads per episode, a $25 CPM, 2 ad spots, and 4 episodes a month, estimated monthly ad revenue is $1,000.00 — $250.00 per episode.',
    breakdown: {
      headline: 'monthlyRevenue',
      headlineLabel: 'Estimated monthly ad revenue',
      outputs: [
        { id: 'monthlyRevenue', label: 'Estimated monthly ad revenue', format: 'currency' },
        { id: 'revenuePerEpisode', label: 'Estimated revenue per episode', format: 'currency' }
      ],
      groups: [
        { title: 'Your show', inputs: ['downloadsPerEpisode', 'episodesPerMonth'] },
        { title: 'Ad deal terms', inputs: ['cpm', 'adSpotsPerEpisode'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'revenuePerEpisode', label: 'Per episode' },
          { from: 'monthlyRevenue', label: 'Per month' }
        ],
        title: 'Revenue per episode vs. per month'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'Podcast sponsorships are priced like other ad media: by CPM',
        paragraphs: [
          'Podcast advertising is usually sold the same way as other media: a CPM, or cost per 1,000 downloads/listens, multiplied by how many downloads the episode gets and how many ad spots it carries. Industry guidance from Influencer Marketing Hub puts typical pre-roll ads (at the start of an episode) around $10 to $20 CPM, host-read mid-roll ads (read live by the host partway through, generally the most valuable placement) around $20 to $40 CPM, and post-roll ads (at the end, with the lowest completion rates) around $10 to $15 CPM. Programmatic (automatically inserted, not host-read) ads tend to run lower and more variable, commonly $5 to $30 CPM.',
          'These are industry-typical ranges, not a fixed, universal rate — actual deals vary by audience size, niche, host-read versus programmatic insertion, exclusivity, and simple negotiating leverage. A larger, more engaged audience in a desirable niche (business, true crime, tech) can often command the higher end or beyond; a small or newly launched show with a less commercially attractive audience may land below it.',
          'This calculator lets you test a CPM within (or outside) that range against your own show\'s downloads, spot count, and episode cadence, so you can see how sensitive your estimated revenue is to the rate you actually negotiate.'
        ]
      },
      howTo: {
        intro: 'Enter your show\'s downloads per episode and episodes per month, then a CPM and ad-spot count to test.',
        steps: [
          { name: 'Enter downloads per episode', text: 'Use a consistent download window (commonly 7 or 30 days post-release) that matches how your potential sponsor measures it.' },
          { name: 'Enter episodes per month', text: 'How many new episodes you typically publish in a month.' },
          { name: 'Choose a CPM to test', text: 'The default, $25, sits inside the typical host-read mid-roll range. Try $15 for a pre-roll-style deal or $35-$40 for a premium host-read slot.' },
          { name: 'Enter ad spots per episode', text: 'How many separate ad reads or insertions each episode carries — commonly 1 to 3 for an independent show.' },
          { name: 'Read the estimate', text: 'The headline is the estimated monthly total; the per-episode figure shows what a single episode\'s ad inventory is estimated to be worth at the CPM you chose.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Revenue per episode is downloads (in thousands) times CPM times the number of ad spots. Monthly revenue multiplies that by episodes per month.',
        expression: 'revenuePerEpisode = (downloadsPerEpisode ÷ 1,000) × CPM × adSpotsPerEpisode\nmonthlyRevenue = revenuePerEpisode × episodesPerMonth',
        terms: [
          { symbol: 'CPM', meaning: 'Cost (to the advertiser) per 1,000 downloads/listens. Typical ranges run roughly $10-$20 for pre-roll, $20-$40 for host-read mid-roll, and $10-$15 for post-roll placements — not a fixed or universal rate.' },
          { symbol: 'adSpotsPerEpisode', meaning: 'How many separate ad placements (pre-roll, mid-roll, post-roll, or a mix) the episode carries, each priced at roughly the same CPM in this simplified model.' }
        ],
        note: 'Estimates only, not a guaranteed sponsorship rate. Real deals often blend different CPMs for different spot positions, apply minimum download thresholds, and are frequently billed per-episode on a flat fee negotiated around (not strictly equal to) a CPM target.'
      },
      workedExample: {
        intro: 'A show gets 5,000 downloads per episode, publishes 4 episodes a month, and is testing a $25 CPM with 2 ad spots per episode.',
        rows: [
          { label: 'Revenue per episode (5,000 ÷ 1,000 × $25 × 2)', value: '$250.00' },
          { label: 'Monthly revenue (250.00 × 4 episodes)', value: '$1,000.00' }
        ],
        result: 'Estimated $250.00 per episode, $1,000.00 per month',
        explanation: 'At the higher end of the host-read mid-roll range, a $40 CPM on the same downloads, spots, and episode count would suggest $1,600.00 per month instead of $1,000.00 — a $600.00 difference from the CPM alone, holding every other number fixed.'
      },
      watchOut: [
        { title: 'CPM ranges are industry-typical, not fixed or guaranteed', body: 'The ranges cited here come from published industry guidance, not a regulator or a universal price list. Your show\'s actual rate depends on audience size, niche, and negotiation, and can fall outside these ranges in either direction.' },
        { title: 'Download counting windows vary', body: 'A download measured in the first 7 days after release is typically lower than one measured over 30 or 60 days. Make sure the downloads-per-episode figure you enter matches the window your sponsor (or ad network) actually uses to price the deal.' },
        { title: 'Not every ad spot is priced the same', body: 'This calculator applies one CPM to every spot for simplicity. Real deals commonly price a host-read mid-roll higher than a pre-roll or post-roll spot on the same episode.' },
        { title: 'Dynamic ad insertion changes who sees what', body: 'Shows using dynamically inserted (programmatic) ads can serve different ads, at different rates, to different listeners of the same episode — the single-CPM model here is a simplification of that reality.' },
        { title: 'Flat per-episode deals are common too', body: 'Many sponsorship deals are negotiated as a flat fee per episode rather than a strict CPM, especially for shows without large, verified download numbers. A flat deal does not have to match what this calculator\'s CPM math would suggest.' }
      ],
      references: [
        { label: 'Influencer Marketing Hub, Podcast Advertising: Costs, Benefits & Best Practices', url: 'https://influencermarketinghub.com/podcast-advertising/' },
        { label: 'Influencer Marketing Hub, Podcast Statistics', url: 'https://influencermarketinghub.com/podcast-statistics/' }
      ]
    },
    inputs: [
      { id: 'downloadsPerEpisode', label: 'Downloads per episode', type: 'number', placeholder: '5000', defaultValue: 5000, step: 100, min: 0 },
      { id: 'episodesPerMonth', label: 'Episodes per month', type: 'number', placeholder: '4', defaultValue: 4, step: 1, min: 0 },
      { id: 'cpm', label: 'CPM to test ($ per 1,000 downloads)', type: 'currency', placeholder: '25', defaultValue: 25, step: 1, min: 0 },
      { id: 'adSpotsPerEpisode', label: 'Ad spots per episode', type: 'number', placeholder: '2', defaultValue: 2, step: 1, min: 0 }
    ],
    seo: {
      title: 'Podcast Ad Revenue Calculator – CPM Sponsorship Estimate',
      description: 'Estimate podcast sponsorship revenue from downloads, a CPM you test against typical industry ranges, and ad spots per episode.',
      faq: [
        { question: 'How is podcast ad revenue calculated?', answer: 'Revenue per episode is downloads ÷ 1,000 × CPM × ad spots. Monthly revenue multiplies that by episodes per month. At 5,000 downloads, a $25 CPM, 2 spots and 4 episodes, that is $250.00 per episode and $1,000.00 per month.' },
        { question: 'What is a typical podcast CPM?', answer: 'Published industry guidance cites roughly $10-$20 CPM for pre-roll ads, $20-$40 for host-read mid-roll ads, and $10-$15 for post-roll ads — typical ranges, not a fixed or guaranteed rate for any individual show.' },
        { question: 'Why does ad spot count matter?', answer: 'Each additional ad spot in an episode is modeled as additional CPM-priced inventory. Two spots at the same CPM produce roughly twice the estimated revenue of one, all else equal.' },
        { question: 'Does this account for different rates for pre-roll vs. mid-roll ads?', answer: 'No, it applies one CPM to every spot for simplicity. Real deals often price a host-read mid-roll higher than pre-roll or post-roll placements on the same episode.' },
        { question: 'What download window should I use?', answer: 'Whichever window your sponsor or ad network prices against — commonly 7, 30, or 60 days post-release. A longer window usually shows a higher download count for the same episode.' },
        { question: 'Are flat-fee sponsorship deals modeled here?', answer: 'No. This calculator models CPM-based pricing only. Many independent shows negotiate flat per-episode fees instead, especially without large, independently verified download numbers.' }
      ]
    },
    compute(values) {
      const revenuePerEpisode = (values.downloadsPerEpisode / 1000) * values.cpm * values.adSpotsPerEpisode;
      const monthlyRevenue = revenuePerEpisode * values.episodesPerMonth;
      return { revenuePerEpisode, monthlyRevenue };
    }
  },
  {
    id: 'blog-ad-revenue-calculator',
    category: 'creator',
    group: 'Monetization & Earnings',
    glyph: '¶',
    updatedAt: '2026-11-17',
    aliases: ['blog income calculator', 'adsense rpm calculator', 'website ad revenue calculator', 'blog pageviews to money calculator'],
    related: ['youtube-earnings-calculator', 'podcast-ad-revenue-calculator', 'freelancer-rate-calculator', 'hashtag-counter'],
    title: 'Blog Ad Revenue Estimator',
    description: 'Estimate monthly and annual blog ad revenue from pageviews and an RPM you provide — your own assumption, not a published average — and solve backward from a target income to the pageviews or RPM it needs.',
    example: 'At 100,000 monthly pageviews and an assumed $10.00 RPM, estimated earnings are $1,000.00/month ($12,000.00/year projected) — the $10.00 is an illustrative input you supply, not a typical or official figure.',
    solver: {
      defaultTarget: 'monthlyEarnings',
      variables: [
        { id: 'monthlyEarnings', label: 'Estimated monthly earnings', symbol: 'E', dimension: 'currency', defaultValue: 1000, defaultUnit: 'currency' },
        { id: 'monthlyPageviews', label: 'Monthly pageviews', symbol: 'V', dimension: 'count', defaultValue: 100000, defaultUnit: 'count' },
        { id: 'rpm', label: 'Assumed RPM (revenue per 1,000 pageviews)', symbol: 'RPM', dimension: 'currency', defaultValue: 10, defaultUnit: 'currency' }
      ],
      solve: {
        monthlyEarnings: ({ monthlyPageviews, rpm }) => (monthlyPageviews / 1000) * rpm,
        monthlyPageviews: ({ monthlyEarnings, rpm }) => (rpm > 0 ? (monthlyEarnings / rpm) * 1000 : NaN),
        rpm: ({ monthlyEarnings, monthlyPageviews }) => (monthlyPageviews > 0 ? (monthlyEarnings / monthlyPageviews) * 1000 : NaN)
      },
      outputs: [
        { id: 'annualEarnings', label: 'Projected annual earnings (× 12)', dimension: 'currency', compute: (si) => ((si.monthlyPageviews / 1000) * si.rpm) * 12 }
      ],
      visuals: [{ type: 'compareBars', bars: [{ from: 'monthlyEarnings', label: 'Per month' }, { from: 'annualEarnings', label: 'Projected per year' }], title: 'Monthly vs. projected annual earnings' }]
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'RPM is the same idea on a blog as on YouTube — an assumption you test, not a fact',
        paragraphs: [
          'Display-ad networks for blogs and other websites — Google AdSense, and premium managed networks like Mediavine and Raptive that larger sites graduate into — report earnings the same way YouTube does: RPM, or revenue per 1,000 pageviews. It already nets out the network\'s own cut, so one multiplication (pageviews ÷ 1,000 × RPM) turns it into an estimated dollar figure.',
          'Just as with YouTube, the hard part is knowing what RPM to use. It depends heavily on site niche (finance and insurance content typically commands a far higher RPM than general entertainment), reader location (US and UK traffic generally earns more than traffic from lower-advertising-spend countries), ad density and placement, the time of year (RPMs often rise toward the holidays), and which network a site qualifies for. None of the ad networks above publish a single fixed RPM figure a blog should expect — a site\'s real RPM is only visible inside its own ad network dashboard.',
          'This calculator treats RPM exactly like the YouTube earnings calculator does: as a number you set and test, not a published average. Replace the default with your own site\'s actual RPM, visible in your AdSense, Mediavine, or Raptive dashboard, for anything beyond a rough what-if.'
        ]
      },
      howTo: {
        intro: 'Fill in any two of estimated monthly earnings, monthly pageviews, and RPM. The third, marked auto, is calculated.',
        steps: [
          { name: 'Enter your monthly pageviews', text: 'Total pageviews across your site in a typical month.' },
          { name: 'Enter an RPM to test', text: 'Use your own site\'s actual RPM from your ad network dashboard if you have it. Otherwise, treat any number here as a placeholder assumption, not a fact.' },
          { name: 'Read the estimated earnings', text: 'Monthly earnings are the headline; the projected annual figure simply multiplies by 12 and assumes the same pageviews and RPM hold steady, which real sites rarely do exactly.' },
          { name: 'Or work backward', text: 'Type a target monthly earnings figure and leave pageviews or RPM alone to see what combination would be needed to reach it.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Earnings are pageviews times RPM, scaled by 1,000 — the exact same shape as a YouTube RPM estimate.',
        expression: 'monthlyEarnings = (monthlyPageviews ÷ 1,000) × RPM\nannualEarnings = monthlyEarnings × 12',
        terms: [
          { symbol: 'RPM', meaning: 'An assumption you supply — not a published or typical figure. Find your own site\'s actual RPM in your ad network\'s own reporting dashboard (AdSense, Mediavine, Raptive, or others).' }
        ],
        note: 'This is a what-if calculation based on an RPM you choose, not an income guarantee or an official figure from any ad network. RPM varies enormously by niche, reader location, ad density, and season, and ad networks do not publish a single expected RPM for a given site.'
      },
      workedExample: {
        intro: 'A blog gets 100,000 pageviews in a month. Testing an assumed RPM of $10.00 — an illustrative input, not a typical figure — what does that suggest?',
        rows: [
          { label: 'Monthly earnings (100,000 ÷ 1,000 × $10.00)', value: '$1,000.00' },
          { label: 'Projected annual earnings (1,000.00 × 12)', value: '$12,000.00' }
        ],
        result: 'At this assumed $10.00 RPM: $1,000.00/month, $12,000.00/year projected',
        explanation: 'Every figure moves proportionally with the assumed RPM: testing $5.00 instead of $10.00 would halve both earnings figures to $500.00/month and $6,000.00/year, while testing $20.00 would double them to $2,000.00/month and $24,000.00/year.'
      },
      watchOut: [
        { title: 'RPM is your assumption, never a guaranteed or typical figure', body: 'No ad network publishes a fixed RPM by niche. Lists of "typical blog RPM by niche" found elsewhere are not official network data and can be outdated — your own ad network dashboard is the only authoritative source for your site\'s real RPM.' },
        { title: 'Niche and reader location drive most of the variation', body: 'A finance or insurance blog with a US audience can see an RPM many times higher than a general-interest blog with a global audience, purely from advertiser demand differences in those niches and markets.' },
        { title: 'Larger, managed ad networks have their own eligibility requirements', body: 'Mediavine, which often pays a higher RPM than self-serve AdSense, publishes two paths to join: $5,000 in annual ad revenue for its full program, or a minimum of 1,000 sessions from Tier 1 countries in 30 days for its self-supported "Journey by Mediavine" option. Raptive is a similarly selective, application-based network with its own (separately published) criteria. Regardless of what this calculator estimates, a site below a network\'s threshold cannot yet apply to it.' },
        { title: 'Pageviews and RPM both change constantly', body: 'A single month\'s numbers are a snapshot. Seasonal ad demand (often higher toward the holidays), algorithm or search-ranking changes, and shifts in audience geography can all move RPM independent of anything a site owner does differently.' },
        { title: 'Display ads are often not a blog\'s only income', body: 'Affiliate links, sponsored posts, and digital products are separate from display-ad revenue and are not modeled by this calculator at all.' }
      ],
      references: [
        { label: 'Mediavine, Eligibility & Application requirements', url: 'https://www.mediavine.com/mediavine-requirements' },
        { label: 'Raptive, raptive.com (publisher network overview)', url: 'https://www.raptive.com/' }
      ]
    },
    inputs: [
      { id: 'monthlyPageviews', label: 'Monthly pageviews', type: 'number', placeholder: '100000', defaultValue: 100000, step: 1000, min: 0 },
      { id: 'rpm', label: 'Revenue per 1,000 pageviews (RPM $)', type: 'currency', placeholder: '10', defaultValue: 10, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Blog Ad Revenue Estimator – What-If RPM Calculator',
      description: 'Estimate blog ad revenue from pageviews and an RPM you test, not a published average. Solve backward from a target income to the pageviews or RPM needed.',
      faq: [
        { question: 'What is blog RPM?', answer: 'RPM (revenue per mille) is estimated ad revenue per 1,000 pageviews, already reflecting the ad network\'s cut. The same concept used by YouTube, applied to a website\'s display ads.' },
        { question: 'Is the RPM on this page an official or average figure?', answer: 'No. It is a placeholder you can change to test different scenarios. No ad network publishes a fixed RPM by niche — your own network dashboard (AdSense, Mediavine, Raptive, or others) is the only authoritative source for your site\'s actual RPM.' },
        { question: 'Why do finance blogs earn a higher RPM than other niches?', answer: 'Advertiser demand (and the amount advertisers are willing to bid) varies enormously by topic. Finance, insurance, and similar high-advertiser-spend niches typically see a materially higher RPM than general-interest or entertainment content, all else equal.' },
        { question: 'How is monthly and annual blog ad revenue calculated here?', answer: 'Monthly earnings are pageviews ÷ 1,000 × RPM. Annual is that figure × 12. At 100,000 monthly pageviews and an assumed $10.00 RPM, that is $1,000/month and a projected $12,000/year.' },
        { question: 'What is the difference between AdSense, Mediavine, and Raptive?', answer: 'AdSense is Google\'s self-serve network, open to most sites. Mediavine and Raptive are managed networks that typically pay a higher RPM but are selective: Mediavine, for example, publishes two paths to join — $5,000 in annual ad revenue, or 1,000 sessions from Tier 1 countries in 30 days for its self-supported option.' },
        { question: 'Does this include affiliate income or sponsored posts?', answer: 'No. It only estimates display-ad revenue from an RPM you supply. Affiliate commissions, sponsored content, and digital product sales are separate income streams not modeled here.' }
      ]
    },
    compute(values) {
      const monthlyEarnings = (values.monthlyPageviews / 1000) * values.rpm;
      const annualEarnings = monthlyEarnings * 12;
      return { monthlyEarnings, annualEarnings };
    }
  },
  {
    id: 'patreon-earnings-calculator',
    category: 'creator',
    group: 'Monetization & Earnings',
    glyph: '♥',
    updatedAt: '2026-11-17',
    aliases: ['patreon income calculator', 'patreon tier revenue calculator', 'how much does patreon take calculator', 'patreon fee calculator'],
    related: ['twitch-earnings-calculator', 'youtube-earnings-calculator', 'affiliate-commission-calculator', 'freelancer-rate-calculator'],
    title: 'Patreon Earnings Calculator',
    description: 'Estimate monthly Patreon earnings across up to three pledge tiers, after Patreon\'s own published 10% platform fee (plus separate payment processing costs Patreon does not fold into that flat number).',
    example: 'With 100 patrons at $5, 30 at $15, and 5 at $50, gross pledges are $1,200.00/month; after Patreon\'s 10% platform fee, estimated net earnings are $1,080.00 — before any separate payment processing costs.',
    breakdown: {
      headline: 'netEarnings',
      headlineLabel: 'Estimated net monthly earnings',
      outputs: [
        { id: 'netEarnings', label: 'Estimated net monthly earnings', format: 'currency' },
        { id: 'grossRevenue', label: 'Gross monthly pledges', format: 'currency' },
        { id: 'platformFee', label: 'Patreon platform fee', format: 'currency' }
      ],
      groups: [
        { title: 'Tier 1', inputs: ['tier1Price', 'tier1Patrons'] },
        { title: 'Tier 2', inputs: ['tier2Price', 'tier2Patrons'] },
        { title: 'Tier 3', inputs: ['tier3Price', 'tier3Patrons'] },
        { title: 'Patreon fee', inputs: ['feePercent'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'tier1Revenue', label: 'Tier 1' },
          { from: 'tier2Revenue', label: 'Tier 2' },
          { from: 'tier3Revenue', label: 'Tier 3' }
        ],
        center: 'netEarnings',
        centerSub: 'net monthly earnings after fee'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'Patreon income is tiers times patrons, minus one published fee',
        paragraphs: [
          'Patreon lets a creator offer several pledge tiers at different price points, each with its own patron count. Unlike TikTok\'s or Twitch\'s per-view and per-Bit economics, Patreon\'s own pricing page publishes a single, specific platform fee: 10% of the income a creator earns on Patreon, regardless of tier. That makes the gross-to-net math for Patreon more straightforward to cite directly than most of the other calculators on this page.',
          'That 10% is not the only cost, though. Patreon\'s own pricing page states that on top of the 10% platform fee, creators also pay "payment processing, currency conversion, and payout fees, and applicable taxes" — real costs, but ones Patreon does not fold into a single published percentage the way it does for the platform fee itself. This calculator models the 10% platform fee only; your actual net deposit will typically be somewhat lower once payment processing is included.',
          'Enter up to three tiers with their price and patron count to see gross pledges, Patreon\'s cut, and an estimated net figure before processing costs.'
        ]
      },
      howTo: {
        intro: 'Enter the price and patron count for up to three pledge tiers. Leave a tier at 0 patrons if you only use one or two.',
        steps: [
          { name: 'Enter Tier 1', text: 'Your lowest-priced tier\'s monthly price and current patron count.' },
          { name: 'Enter Tier 2 and Tier 3', text: 'Add your other tiers the same way. Set a tier\'s patron count to 0 if you don\'t offer it.' },
          { name: 'Check the platform fee', text: 'Defaults to Patreon\'s published 10%. Patreon has used different fee structures in the past for creators who joined under them; adjust this if your account is on a legacy plan.' },
          { name: 'Read gross pledges and net earnings', text: 'Gross is every tier\'s price times patrons, summed. Net subtracts only the 10% platform fee — not the separate payment processing costs Patreon charges on top.' },
          { name: 'Check the tier composition', text: 'The donut shows how much of your gross pledges comes from each tier.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Each tier\'s revenue is its price times its patron count. Gross revenue sums all three; net subtracts the platform fee.',
        expression: 'tierRevenue = tierPrice × tierPatrons\ngrossRevenue = tier1Revenue + tier2Revenue + tier3Revenue\nplatformFee = grossRevenue × (feePercent ÷ 100)\nnetEarnings = grossRevenue − platformFee',
        terms: [
          { symbol: 'feePercent', meaning: 'Patreon\'s own published platform fee is 10% of creator earnings, which is the default here.' }
        ],
        note: 'Patreon\'s pricing page also lists separate payment processing, currency conversion, and payout fees on top of the 10% platform fee, without publishing one flat percentage for them — so netEarnings here is before those additional, variable costs, not your final deposit.'
      },
      workedExample: {
        intro: 'A creator has 100 patrons at a $5 tier, 30 at a $15 tier, and 5 at a $50 tier, on Patreon\'s published 10% platform fee.',
        rows: [
          { label: 'Tier 1 revenue (100 × $5)', value: '$500.00' },
          { label: 'Tier 2 revenue (30 × $15)', value: '$450.00' },
          { label: 'Tier 3 revenue (5 × $50)', value: '$250.00' },
          { label: 'Gross monthly pledges (500 + 450 + 250)', value: '$1,200.00' },
          { label: 'Patreon platform fee (1,200 × 10%)', value: '$120.00' },
          { label: 'Estimated net earnings (1,200 − 120)', value: '$1,080.00' }
        ],
        result: 'Gross $1,200.00, platform fee $120.00, estimated net $1,080.00 (before payment processing costs)',
        explanation: 'The $1,080.00 net figure reflects only Patreon\'s published 10% platform fee; because payment processing, currency conversion, and payout fees are charged separately and are not published as one flat rate, a creator\'s actual deposited amount will typically be somewhat lower than $1,080.00.'
      },
      watchOut: [
        { title: 'Net earnings here is before payment processing costs', body: 'Patreon\'s own pricing page lists payment processing, currency conversion, and payout fees as separate from the 10% platform fee, without publishing one flat rate for them — this calculator cannot model a cost Patreon has not published as a single percentage.' },
        { title: 'Some legacy creators are on different fee plans', body: 'Patreon has changed its fee structure over the years; some creators who joined under an older plan may be on a different percentage than the current published 10%. Check your own Patreon payout settings for your actual rate.' },
        { title: 'Patron churn is not modeled', body: 'This calculator treats the patron counts you enter as a snapshot. Real Patreon income fluctuates as patrons join and leave, and as failed or declined payments occur.' },
        { title: 'Per-charge Patreon fees are different from monthly-only billing', body: 'If a creator bills per post/creation rather than monthly, the specifics of how and when fees are charged can differ. Check Patreon\'s current documentation for your own billing setting.' }
      ],
      references: [
        { label: 'Patreon, Pricing — platform fees and plans', url: 'https://www.patreon.com/pricing' },
        { label: 'Patreon, patreon.com (membership tiers overview)', url: 'https://www.patreon.com/' }
      ]
    },
    inputs: [
      { id: 'tier1Price', label: 'Tier 1 price ($/month)', type: 'currency', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'tier1Patrons', label: 'Tier 1 patrons', type: 'number', placeholder: '100', defaultValue: 100, step: 1, min: 0 },
      { id: 'tier2Price', label: 'Tier 2 price ($/month)', type: 'currency', placeholder: '15', defaultValue: 15, step: 1, min: 0 },
      { id: 'tier2Patrons', label: 'Tier 2 patrons', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 0 },
      { id: 'tier3Price', label: 'Tier 3 price ($/month)', type: 'currency', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'tier3Patrons', label: 'Tier 3 patrons', type: 'number', placeholder: '5', defaultValue: 5, step: 1, min: 0 },
      { id: 'feePercent', label: 'Patreon platform fee (%)', type: 'percent', placeholder: '10', defaultValue: 10, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Patreon Earnings Calculator – Tiers Minus Platform Fee',
      description: 'Estimate monthly Patreon earnings across up to three pledge tiers, after Patreon\'s own published 10% platform fee.',
      faq: [
        { question: 'How much fee does Patreon take?', answer: 'Patreon\'s own pricing page publishes a 10% platform fee on creator earnings, plus separate payment processing, currency conversion, and payout fees it does not fold into one flat percentage.' },
        { question: 'How is Patreon net income calculated here?', answer: 'Each tier\'s price times its patron count, summed into gross pledges, minus the platform fee percentage. At 100 patrons × $5, 30 × $15, and 5 × $50 with a 10% fee, gross is $1,200.00 and net is $1,080.00.' },
        { question: 'Does the net figure include payment processing fees?', answer: 'No. Patreon publishes its 10% platform fee as one flat number but describes payment processing, currency conversion, and payout fees separately, without a single published percentage — so this calculator\'s net figure is before those costs.' },
        { question: 'Can I model more than three tiers?', answer: 'This calculator supports three tiers. For more, add the extra tiers\' revenue together yourself and enter the combined figures across the slots provided, or treat the result as an estimate for your three main tiers.' },
        { question: 'Are all Patreon creators on the same 10% fee?', answer: 'The current published rate is 10% for new creators. Some creators who joined under an older Patreon fee structure may be on a different plan — check your own account\'s payout settings for your actual rate.' },
        { question: 'What is the difference between this and the Twitch earnings calculator?', answer: 'twitch-earnings-calculator models Twitch\'s subscription revenue split, Bits, and ad revenue. This calculator is specific to Patreon\'s tier-and-patron pledge model and its own published platform fee.' }
      ]
    },
    compute(values) {
      const tier1Revenue = values.tier1Price * values.tier1Patrons;
      const tier2Revenue = values.tier2Price * values.tier2Patrons;
      const tier3Revenue = values.tier3Price * values.tier3Patrons;
      const grossRevenue = tier1Revenue + tier2Revenue + tier3Revenue;
      const platformFee = grossRevenue * (values.feePercent / 100);
      const netEarnings = grossRevenue - platformFee;
      return { tier1Revenue, tier2Revenue, tier3Revenue, grossRevenue, platformFee, netEarnings };
    }
  },
  {
    id: 'affiliate-commission-calculator',
    category: 'creator',
    group: 'Monetization & Earnings',
    glyph: '→',
    updatedAt: '2026-11-17',
    aliases: ['affiliate marketing calculator', 'affiliate income calculator', 'affiliate link earnings calculator', 'clicks to commission calculator'],
    related: ['blog-ad-revenue-calculator', 'patreon-earnings-calculator', 'youtube-earnings-calculator', 'freelancer-rate-calculator'],
    title: 'Affiliate Commission Calculator',
    description: 'Estimate affiliate marketing earnings from clicks, your conversion rate, average order value, and commission rate — the clicks-to-conversion funnel specific to affiliate links, not a general sales commission.',
    example: 'With 10,000 affiliate link clicks, a 2% conversion rate, a $50 average order, and a 5% commission rate, estimated commission earned is $500.00 from $10,000.00 in sales generated.',
    breakdown: {
      headline: 'commissionEarned',
      headlineLabel: 'Estimated commission earned',
      outputs: [
        { id: 'commissionEarned', label: 'Estimated commission earned', format: 'currency' },
        { id: 'conversions', label: 'Estimated conversions', format: 'integer' },
        { id: 'totalSalesGenerated', label: 'Total sales generated', format: 'currency' }
      ],
      groups: [
        { title: 'Traffic', inputs: ['clicks', 'conversionRatePercent'] },
        { title: 'Sale and commission', inputs: ['averageOrderValue', 'commissionRatePercent'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'totalSalesGenerated', label: 'Sales generated' },
          { from: 'commissionEarned', label: 'Your commission' }
        ],
        title: 'Sales generated vs. commission earned'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'Affiliate commission is a funnel, not just a sale amount',
        paragraphs: [
          'Affiliate marketing has a specific shape that a general sales commission does not: a reader clicks a link, some share of those clicks convert into a sale, and the affiliate earns a percentage of each sale\'s value. This calculator models that whole clicks-to-conversion-to-commission funnel, which is what makes it a genuinely different calculation from a flat "commission on a sale amount I already know" tool.',
          'The relationship between an affiliate link and a commission is exactly what the US Federal Trade Commission\'s own endorsement guidance describes: "When people read what I\'ve written about a particular product and then click on those links and buy something from the retailer, I earn a commission from the retailer." That same guidance is also why an affiliate relationship has to be disclosed clearly to readers — not just calculated.',
          'There is no single published conversion rate, average order value, or commission rate that applies to affiliate marketing generally: all three vary enormously by niche, program, and traffic quality. Every default on this page is an illustrative starting point for you to replace with your own program\'s real numbers.'
        ]
      },
      howTo: {
        intro: 'Enter your clicks and conversion rate, then the average order value and commission rate your affiliate program pays.',
        steps: [
          { name: 'Enter your clicks', text: 'Total clicks on your affiliate links in the period you are estimating for.' },
          { name: 'Enter your conversion rate', text: 'The share of clicks that actually result in a purchase — check your affiliate network\'s own reporting for your real rate rather than guessing.' },
          { name: 'Enter the average order value', text: 'The typical dollar amount of a purchase made through your link.' },
          { name: 'Enter your commission rate', text: 'The percentage of the sale your specific affiliate program pays — this varies enormously by program and product category, so use your own program\'s published rate.' },
          { name: 'Read the estimate', text: 'The headline is your estimated commission; the breakdown also shows the conversions and total sales value your clicks are estimated to generate.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Clicks times conversion rate gives conversions. Conversions times average order value gives sales generated. Sales generated times commission rate gives your commission.',
        expression: 'conversions = clicks × (conversionRatePercent ÷ 100)\ntotalSalesGenerated = conversions × averageOrderValue\ncommissionEarned = totalSalesGenerated × (commissionRatePercent ÷ 100)',
        terms: [
          { symbol: 'conversionRatePercent', meaning: 'The share of clicks that result in a purchase. Varies enormously by niche, traffic source, and how directly the content matches buying intent.' },
          { symbol: 'commissionRatePercent', meaning: 'The percentage of the sale your specific affiliate program pays. No standard rate exists across affiliate marketing generally — every program and product category sets its own.' }
        ],
        note: 'Estimates only. Real affiliate programs often have cookie-duration windows, return/refund clawbacks, and tiered commission rates that increase with sales volume — none of which this simplified funnel models.'
      },
      workedExample: {
        intro: 'An affiliate link gets 10,000 clicks, with a 2% conversion rate, a $50 average order value, and a 5% commission rate.',
        rows: [
          { label: 'Conversions (10,000 × 2%)', value: '200' },
          { label: 'Total sales generated (200 × $50)', value: '$10,000.00' },
          { label: 'Commission earned (10,000 × 5%)', value: '$500.00' }
        ],
        result: 'Estimated commission: $500.00 from $10,000.00 in sales generated',
        explanation: 'Doubling the conversion rate to 4% (holding clicks, order value, and commission rate fixed) would double both the sales generated and the commission earned, to $20,000.00 in sales and $1,000.00 in commission — a reminder that conversion rate, not just traffic, drives this estimate just as much as clicks do.'
      },
      watchOut: [
        { title: 'This is specifically an affiliate-marketing funnel, not a general sales commission', body: 'A flat "sale amount × commission rate" calculation (useful for a salesperson quoting a known sale) is a different shape of problem from this clicks → conversion rate → commission funnel, which is specific to affiliate marketing\'s click-based structure.' },
        { title: 'No standard conversion rate or commission rate exists', body: 'Both vary enormously by niche, traffic quality, and individual affiliate program — there is no government-set or industry-standard figure the way there is for some other rates on this site. Every number here is an assumption you enter.' },
        { title: 'Affiliate relationships must be disclosed', body: 'The FTC\'s own endorsement guidance requires disclosing an affiliate relationship to readers clearly and conspicuously — language like "I get commissions for purchases made through links in this post" is recommended, while a vague term like "affiliate link" alone may not be enough. The FTC\'s related influencer guidance frames this broadly: "Disclose when you have any financial, employment, personal, or family relationship with a brand."' },
        { title: 'Cookie windows and returns are not modeled', body: 'Many affiliate programs only count a sale if it happens within a set cookie window (commonly 24 hours to 30+ days) after the click, and claw back commission if the buyer later returns the item. This calculator estimates the gross funnel, not those program-specific adjustments.' },
        { title: 'Commission rates are sometimes tiered', body: 'Some affiliate programs raise the commission rate once a partner crosses a sales volume threshold in a period. A single flat rate, as modeled here, may understate earnings for a program with such tiers.' }
      ],
      references: [
        { label: 'Federal Trade Commission, FTC\'s Endorsement Guides: What People Are Asking', url: 'https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking' },
        { label: 'Federal Trade Commission, Disclosures 101 for Social Media Influencers', url: 'https://www.ftc.gov/business-guidance/resources/disclosures-101-social-media-influencers' }
      ]
    },
    inputs: [
      { id: 'clicks', label: 'Affiliate link clicks', type: 'number', placeholder: '10000', defaultValue: 10000, step: 100, min: 0 },
      { id: 'conversionRatePercent', label: 'Conversion rate (%)', type: 'percent', placeholder: '2', defaultValue: 2, step: 0.1, min: 0 },
      { id: 'averageOrderValue', label: 'Average order value ($)', type: 'currency', placeholder: '50', defaultValue: 50, step: 1, min: 0 },
      { id: 'commissionRatePercent', label: 'Commission rate (%)', type: 'percent', placeholder: '5', defaultValue: 5, step: 0.5, min: 0 }
    ],
    seo: {
      title: 'Affiliate Commission Calculator – Clicks to Earnings',
      description: 'Estimate affiliate marketing commission from clicks, conversion rate, average order value, and commission rate — the affiliate-specific clicks-to-sale funnel.',
      faq: [
        { question: 'How is affiliate commission calculated?', answer: 'Clicks × conversion rate gives conversions. Conversions × average order value gives total sales generated. Sales generated × commission rate gives commission earned. At 10,000 clicks, 2% conversion, $50 orders and 5% commission, that is $500.00 from $10,000.00 in sales.' },
        { question: 'What is a typical affiliate conversion rate?', answer: 'There is no single standard figure — it varies enormously by niche, traffic source, and how closely the content matches buying intent. Use your own affiliate network\'s reporting for your real conversion rate rather than a generic assumption.' },
        { question: 'How is this different from a general sales commission calculator?', answer: 'A general commission calculator starts from a known sale amount. This calculator models the full affiliate-marketing funnel — clicks through conversion rate to a sale, then commission — which is the shape affiliate earnings actually take.' },
        { question: 'Do I have to disclose affiliate links?', answer: 'Yes. The FTC\'s endorsement guidance requires disclosing the relationship clearly and conspicuously to readers; a vague label like "affiliate link" alone may not satisfy that requirement.' },
        { question: 'Does this calculator account for returns or a cookie window?', answer: 'No. It estimates the gross clicks-to-commission funnel only. Real affiliate programs may claw back commission on returned items or only count sales within a set cookie window after the click.' },
        { question: 'What commission rate should I use?', answer: 'Your specific affiliate program\'s published rate for the product category you are promoting — rates vary enormously by program and category, so there is no universal figure to default to.' }
      ]
    },
    compute(values) {
      const conversions = values.clicks * (values.conversionRatePercent / 100);
      const totalSalesGenerated = conversions * values.averageOrderValue;
      const commissionEarned = totalSalesGenerated * (values.commissionRatePercent / 100);
      return { conversions, totalSalesGenerated, commissionEarned };
    }
  },
  {
    id: 'follower-growth-rate-calculator',
    category: 'creator',
    group: 'Engagement & Growth',
    glyph: '↑',
    updatedAt: '2026-11-17',
    aliases: ['social media growth rate calculator', 'follower growth calculator', 'instagram growth rate calculator', 'how fast am i growing followers'],
    related: ['instagram-engagement-calculator', 'video-engagement-rate-calculator', 'tiktok-earnings-calculator', 'youtube-earnings-calculator'],
    title: 'Follower Growth Rate Calculator',
    description: 'Calculate your percentage follower growth over a period and a simple straight-line projection of where that pace would put you next, from your own starting and ending follower counts.',
    example: 'Going from 1,000 to 1,200 followers over 30 days is 20% growth, gaining about 6.7 followers a day — at that same daily pace, a projection puts you at roughly 1,400 followers 30 days later.',
    breakdown: {
      headline: 'growthRatePercent',
      headlineLabel: 'Growth rate over the period',
      outputs: [
        { id: 'growthRatePercent', label: 'Growth rate over the period', format: 'percent' },
        { id: 'followersGained', label: 'Followers gained', format: 'integer' },
        { id: 'dailyGrowthRate', label: 'Average followers gained per day', format: 'number' },
        { id: 'projectedFollowersIn30Days', label: 'Projected followers in 30 more days (straight-line)', format: 'integer' }
      ],
      groups: [
        { title: 'Your follower count', inputs: ['startFollowers', 'endFollowers'] },
        { title: 'Over this period', inputs: ['periodDays'] }
      ],
      visual: {
        type: 'compareBars',
        bars: [
          { from: 'startFollowers', label: 'Start' },
          { from: 'endFollowers', label: 'Now' },
          { from: 'projectedFollowersIn30Days', label: 'Projected +30 days' }
        ],
        title: 'Start, now, and a 30-day straight-line projection',
        highlight: 1
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'Growth rate is a percent change; a projection is just extending the trend',
        paragraphs: [
          'Follower growth rate is the same percent-change calculation used throughout math and finance, applied to a follower count: the change over a period, divided by where you started, as a percentage. It tells you how much you grew relative to your starting size — a gain of 200 followers means something very different to an account with 1,000 followers than to one with 100,000.',
          'The straight-line projection on this page takes your average daily gain over the period you entered and extends it forward 30 more days, assuming that exact pace continues unchanged. Real account growth is almost never perfectly linear — it responds to posting frequency, a single viral post, seasonality, algorithm changes, and audience saturation — so treat the projection as "if nothing changes," not a forecast you should bank on.',
          'There is no official "good" growth rate published by any platform; what counts as fast growth varies enormously by account size (small accounts can post triple-digit percentage growth more easily than large ones), niche, and posting frequency. Comparing your own rate over successive periods is more meaningful than comparing it to an unsourced benchmark.'
        ]
      },
      howTo: {
        intro: 'Enter your follower count at the start and end of a period, and the number of days between them.',
        steps: [
          { name: 'Enter your starting follower count', text: 'Your follower count at the beginning of the period you want to measure.' },
          { name: 'Enter your current (ending) follower count', text: 'Your follower count now, or at the end of the period.' },
          { name: 'Enter the number of days between them', text: 'How many days separate the two counts above.' },
          { name: 'Read your growth rate', text: 'The headline is your percentage growth over that exact period — not an annualized or daily rate by itself.' },
          { name: 'Check the projection', text: 'The straight-line projection shows where your current average daily gain would put you 30 days from now, if that exact pace continued unchanged.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Growth rate is the standard percent-change formula. The projection multiplies the average daily gain by 30 and adds it to your current count.',
        expression: 'followersGained = endFollowers − startFollowers\ngrowthRatePercent = (followersGained ÷ startFollowers) × 100\ndailyGrowthRate = followersGained ÷ periodDays\nprojectedFollowersIn30Days = endFollowers + (dailyGrowthRate × 30)',
        terms: [
          { symbol: 'growthRatePercent', meaning: 'Percent change in followers over the exact period entered — the standard percent-change formula applied to a follower count.' },
          { symbol: 'projectedFollowersIn30Days', meaning: 'A straight-line (linear) projection only: it assumes the measured average daily gain continues unchanged, which real account growth rarely does exactly.' }
        ],
        note: 'The projection is a simple linear extrapolation, not a statistical forecast. It does not account for diminishing returns, algorithm changes, seasonality, or a single post skewing the measured period.'
      },
      workedExample: {
        intro: 'An account grows from 1,000 to 1,200 followers over 30 days.',
        rows: [
          { label: 'Followers gained (1,200 − 1,000)', value: '200' },
          { label: 'Growth rate (200 ÷ 1,000 × 100)', value: '20.00%' },
          { label: 'Average daily gain (200 ÷ 30 days)', value: '≈6.67/day' },
          { label: 'Projected followers in 30 more days (1,200 + 6.67 × 30)', value: '≈1,400' }
        ],
        result: '20.00% growth over 30 days; a straight-line projection suggests ≈1,400 followers 30 days later',
        explanation: 'The same 200-follower gain measured over 60 days instead of 30 would still be 20.00% growth (the percentage only depends on the start and end counts), but the average daily gain would halve to about 3.33/day, and the 30-day projection would drop to 1,300 instead of 1,400 — the projection is sensitive to the measurement period even when the percentage growth is not.'
      },
      watchOut: [
        { title: 'The projection assumes nothing changes', body: 'A straight-line projection only extends the exact average daily pace measured over your chosen period. A viral post, a slow week, or a platform algorithm change can all make real growth deviate from this quickly.' },
        { title: 'There is no official "good" growth rate', body: 'No platform publishes a benchmark growth rate, and what counts as fast varies enormously by account size, niche, and posting frequency. Track your own rate over successive periods rather than comparing to an unsourced number.' },
        { title: 'A short measurement period can be misleading', body: 'Growth measured over just a few days can be dominated by one unusually good or bad day. A longer period (several weeks or a month) usually gives a more representative daily average.' },
        { title: 'Purchased or bot followers inflate growth without real engagement', body: 'A follower count can rise from low-quality or purchased followers just as easily as from genuine audience growth — this calculator has no way to distinguish the two.' }
      ],
      references: [
        { label: 'OpenStax, Prealgebra 2e, §6.2 Solve General Applications of Percent', url: 'https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent' },
        { label: 'Wolfram MathWorld, Percent', url: 'https://mathworld.wolfram.com/Percent.html' }
      ]
    },
    inputs: [
      { id: 'startFollowers', label: 'Starting follower count', type: 'number', placeholder: '1000', defaultValue: 1000, step: 10, min: 1 },
      { id: 'endFollowers', label: 'Current (ending) follower count', type: 'number', placeholder: '1200', defaultValue: 1200, step: 10, min: 0 },
      { id: 'periodDays', label: 'Over this many days', type: 'number', placeholder: '30', defaultValue: 30, step: 1, min: 1 }
    ],
    seo: {
      title: 'Follower Growth Rate Calculator – % Growth + Projection',
      description: 'Calculate your percentage follower growth over a period and a simple straight-line projection of where that pace would put you 30 days from now.',
      faq: [
        { question: 'How is follower growth rate calculated?', answer: 'Followers gained (end minus start) divided by the starting count, times 100. Going from 1,000 to 1,200 followers is (1,200 − 1,000) ÷ 1,000 × 100 = 20% growth over that period.' },
        { question: 'How does the 30-day projection work?', answer: 'It takes your average daily gain (followers gained ÷ days in the period) and multiplies it by 30, adding that to your current count. It assumes your exact measured pace continues unchanged, which is a simplification, not a forecast.' },
        { question: 'What is a good follower growth rate?', answer: 'No platform publishes an official benchmark. What counts as fast growth varies enormously by account size, niche, and posting frequency — comparing your own rate across periods is more meaningful than any generic figure.' },
        { question: 'Why does the period length matter if the percentage stays the same?', answer: 'The growth percentage only depends on your start and end counts. But the average daily gain — and therefore the 30-day projection — depends on how many days that gain happened over, so a longer period with the same total gain produces a lower daily rate and projection.' },
        { question: 'Does this calculator account for a viral post or an algorithm change?', answer: 'No. The projection is a simple straight-line extrapolation of your measured average daily gain. It cannot anticipate a sudden spike, a slowdown, or a platform change.' },
        { question: 'Can I use this for a decline in followers?', answer: 'Yes. If your ending count is lower than your starting count, the growth rate and projection will both come out negative, reflecting a shrinking audience over the period measured.' }
      ]
    },
    compute(values) {
      const followersGained = values.endFollowers - values.startFollowers;
      const growthRatePercent = (followersGained / values.startFollowers) * 100;
      const dailyGrowthRate = followersGained / values.periodDays;
      const projectedFollowersIn30Days = values.endFollowers + dailyGrowthRate * 30;
      return { followersGained, growthRatePercent, dailyGrowthRate, projectedFollowersIn30Days };
    }
  },
  {
    id: 'video-engagement-rate-calculator',
    category: 'creator',
    group: 'Engagement & Growth',
    glyph: '▶',
    updatedAt: '2026-11-17',
    aliases: ['view based engagement rate calculator', 'video er calculator', 'tiktok engagement rate calculator', 'youtube video engagement calculator'],
    related: ['instagram-engagement-calculator', 'follower-growth-rate-calculator', 'tiktok-earnings-calculator', 'youtube-earnings-calculator'],
    title: 'Video Engagement Rate Calculator',
    description: 'Calculate a video\'s view-based engagement rate — likes plus comments plus shares, divided by views — the convention TikTok, YouTube, and Instagram Reels use for video content, distinct from a follower-based engagement rate.',
    example: 'A video with 100,000 views, 4,000 likes, 300 comments and 200 shares has a 4.5% view-based engagement rate.',
    breakdown: {
      headline: 'engagementRate',
      headlineLabel: 'View-based engagement rate',
      outputs: [
        { id: 'engagementRate', label: 'View-based engagement rate', format: 'percent' },
        { id: 'totalEngagement', label: 'Total engagement', format: 'integer' }
      ],
      groups: [
        { title: 'Video performance', inputs: ['views', 'likes', 'comments', 'shares'] }
      ],
      visual: {
        type: 'donut',
        segments: [
          { from: 'likes', label: 'Likes' },
          { from: 'comments', label: 'Comments' },
          { from: 'shares', label: 'Shares' }
        ],
        center: 'totalEngagement',
        centerSub: 'total engagement on this video'
      }
    },
    content: {
      lastReviewed: '2026-11-17',
      concept: {
        title: 'A view-based rate, not a follower-based one',
        paragraphs: [
          'This calculator measures engagement as a share of a video\'s views, not a share of an account\'s followers — a genuinely different metric shape from a follower-based engagement rate like the one on this site\'s own Instagram engagement calculator. Industry guidance from Hootsuite describes this as the standard convention specifically for video content: "On TikTok, ER views is the standard approach: likes plus comments plus shares plus saves, divided by total video views, multiplied by 100," and that YouTube engagement is calculated the same way — likes, comments, and shares divided by total views.',
          'View-based and follower-based engagement rates answer different questions and are not directly comparable. A video can rack up huge views (and therefore a denominator) from non-followers via a recommendation algorithm, which a follower-based formula would never capture; conversely, a follower-based rate reflects how an existing audience responds, regardless of how far a specific post traveled beyond them.',
          'That same guidance notes Instagram Reels specifically benefits from the view-based formula too, "because Instagram reports views for Reels, ER views gives you a more consistent read" than the reach-based formulas sometimes used for regular feed posts. This calculator is built for exactly that view-based convention — TikTok, YouTube, and Instagram Reels all report views at the video level, which is what the formula needs.'
        ]
      },
      howTo: {
        intro: 'Enter a single video\'s views, likes, comments, and shares.',
        steps: [
          { name: 'Enter the video\'s views', text: 'Total views on the specific video you are measuring.' },
          { name: 'Enter likes, comments, and shares', text: 'The same video\'s totals for each. If your platform also reports "saves," you can add those into the shares field to match the broader TikTok-style convention, or track them separately.' },
          { name: 'Read the engagement rate', text: 'The headline is total engagement divided by views, as a percentage — this video\'s view-based engagement rate.' },
          { name: 'Check the composition', text: 'The donut shows how that engagement splits between likes, comments, and shares.' }
        ],
        outro: 'Everything is calculated in your browser from the numbers you type. Nothing is looked up, sent, or stored.'
      },
      formula: {
        intro: 'Total engagement is likes plus comments plus shares. Engagement rate is that total divided by views, as a percentage.',
        expression: 'totalEngagement = likes + comments + shares\nengagementRate = totalEngagement ÷ views × 100',
        terms: [
          { symbol: 'engagementRate', meaning: 'This video\'s engagement as a percentage of its own views — the convention Hootsuite\'s guidance describes TikTok and YouTube using for video content, and recommends for Instagram Reels specifically.' }
        ],
        note: 'No platform publishes an official "good" view-based engagement rate. It varies by format, niche, and how a video was distributed (recommended to non-followers vs. shown mainly to existing followers), so comparing a video to your own past videos is more meaningful than any outside benchmark.'
      },
      workedExample: {
        intro: 'A video gets 100,000 views, 4,000 likes, 300 comments, and 200 shares.',
        rows: [
          { label: 'Total engagement (4,000 + 300 + 200)', value: '4,500' },
          { label: 'Engagement rate (4,500 ÷ 100,000 × 100)', value: '4.50%' }
        ],
        result: 'View-based engagement rate: 4.50%',
        explanation: 'If the same video had reached twice as many views (200,000) with the same likes, comments, and shares, the engagement rate would halve to 2.25% — a reminder that this formula\'s denominator is views, so a video that travels further without a proportional rise in likes/comments/shares will show a lower rate even though the raw engagement count did not change.'
      },
      watchOut: [
        { title: 'This is not the same metric as a follower-based engagement rate', body: 'This site\'s Instagram engagement calculator divides by followers; this calculator divides by views. The two measure different things and are not directly comparable, even for the same account.' },
        { title: 'No platform publishes an official "good" rate', body: 'What counts as a strong view-based engagement rate varies by format, niche, and distribution — there is no universal benchmark to compare against. Your own account\'s trend over time is more meaningful.' },
        { title: '"Saves" are sometimes included and sometimes not', body: 'Some platforms\' own reporting folds saves into the view-based engagement calculation alongside likes, comments, and shares. This calculator keeps the formula to likes, comments, and shares; add saves into the shares field yourself if you want to match that broader convention.' },
        { title: 'A video shown mostly to non-followers behaves differently', body: 'Algorithmic distribution to people who don\'t follow the account can inflate views relative to likes/comments/shares (since a stranger is statistically less likely to engage than a follower), which tends to lower the view-based rate even for a genuinely well-performing video.' }
      ],
      references: [
        { label: 'Hootsuite, How to Calculate Engagement Rate on Every Platform', url: 'https://blog.hootsuite.com/calculate-engagement-rate/' },
        { label: 'Instagram for Creators, Create Engaging Content', url: 'https://creators.instagram.com/create-engaging-content' }
      ]
    },
    inputs: [
      { id: 'views', label: 'Video views', type: 'number', placeholder: '100000', defaultValue: 100000, step: 1000, min: 100 },
      { id: 'likes', label: 'Likes', type: 'number', placeholder: '4000', defaultValue: 4000, step: 50, min: 0 },
      { id: 'comments', label: 'Comments', type: 'number', placeholder: '300', defaultValue: 300, step: 10, min: 0 },
      { id: 'shares', label: 'Shares', type: 'number', placeholder: '200', defaultValue: 200, step: 10, min: 0 }
    ],
    seo: {
      title: 'Video Engagement Rate Calculator – View-Based ER',
      description: 'Calculate a video\'s view-based engagement rate (likes + comments + shares ÷ views) — the convention TikTok, YouTube, and Instagram Reels use.',
      faq: [
        { question: 'How is video engagement rate calculated?', answer: 'Add likes, comments, and shares, then divide by views and multiply by 100. A video with 4,000 likes, 300 comments, 200 shares and 100,000 views has a (4,500 ÷ 100,000) × 100 = 4.50% engagement rate.' },
        { question: 'How is this different from the Instagram engagement calculator on this site?', answer: 'That calculator divides total engagement by follower count. This one divides by views instead — the convention industry guidance describes TikTok, YouTube, and Instagram Reels using for video content specifically. The two are different metrics and are not directly comparable.' },
        { question: 'Which platforms use a view-based engagement rate?', answer: 'Industry guidance describes TikTok and YouTube using a views-based formula (likes + comments + shares ÷ views) as standard for video content, and recommends the same approach for Instagram Reels specifically, since Reels report views at the post level.' },
        { question: 'Should I include saves in the shares field?', answer: 'Some platforms\' own reporting folds saves into the engagement total alongside likes, comments, and shares. This calculator keeps the formula to those three; add your saves count into the shares field if you want to match that broader convention.' },
        { question: 'What is a good video engagement rate?', answer: 'No platform publishes an official benchmark. It varies by format, niche, and how a video was distributed — comparing your own videos to each other over time is more meaningful than any outside figure.' },
        { question: 'Why might a video with more views show a lower engagement rate?', answer: 'Because views are the denominator, a video that reaches many non-followers through algorithmic recommendation can show a lower rate than a smaller video shown mostly to an engaged existing audience, even with a similar raw number of likes and comments.' }
      ]
    },
    compute(values) {
      const totalEngagement = values.likes + values.comments + values.shares;
      const engagementRate = (totalEngagement / values.views) * 100;
      return { totalEngagement, engagementRate };
    }
  }
];
