'use client';

import { useState } from 'react';
import { AuditResult } from '@/types';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState('');

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let cleanUrl = url.trim();
    
    if (!cleanUrl) {
      setError('Please enter a website URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: cleanUrl })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to audit website');
    } finally {
      setLoading(false);
    }
  };

  const generateChecklist = (issues: any, url: string) => {
    const websiteName = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    return [
      {
        name: 'Meta Title Tag',
        status: issues.title && issues.title !== 'Missing Title Tag' ? '✅ Present' : '❌ Missing',
        explanation: issues.title && issues.title !== 'Missing Title Tag' 
          ? `Your title tag "${issues.title}" is present. However, make sure it includes your main keywords and is under 60 characters.`
          : `Your website (${websiteName}) is missing a Meta Title Tag. This means search engines don't know what your page is about. Without it, your website will not rank well on Google, and people will not click on your result.`,
        disadvantage: issues.title && issues.title !== 'Missing Title Tag'
          ? 'Ensure your title tag is optimized with keywords and is 50-60 characters long for best results.'
          : '❌ DISADVANTAGE: Your website will not appear properly in search results. You are losing potential customers because nobody can find your website on Google.'
      },
      {
        name: 'Meta Description',
        status: issues.metaDescription && issues.metaDescription !== 'Missing Meta Description' ? '✅ Present' : '❌ Missing',
        explanation: issues.metaDescription && issues.metaDescription !== 'Missing Meta Description'
          ? `Your meta description "${issues.metaDescription.substring(0, 50)}..." is present. It should be compelling and include keywords.`
          : `Your website (${websiteName}) is missing a Meta Description. This is the text that appears below your title in search results. Without it, Google will show random text from your page, which may not convince people to click.`,
        disadvantage: issues.metaDescription && issues.metaDescription !== 'Missing Meta Description'
          ? 'Optimize your meta description to be 150-160 characters and include a call-to-action.'
          : '❌ DISADVANTAGE: Your click-through rate from Google will be very low. People won\'t know what your website offers, so they will choose your competitors instead.'
      },
      {
        name: 'H1 Headings',
        status: issues.hasH1 ? '✅ Present' : '❌ Missing',
        explanation: issues.hasH1
          ? `Your website has ${issues.h1Count} H1 heading(s). This is good for SEO structure.`
          : `Your website (${websiteName}) has no H1 heading. The H1 heading is the main title of your page that tells Google and visitors what your page is about.`,
        disadvantage: issues.hasH1
          ? 'Make sure your H1 heading is clear, includes your main keyword, and appears only once per page.'
          : '❌ DISADVANTAGE: Search engines will have difficulty understanding your page\'s main topic. This will lower your rankings and confuse your visitors.'
      },
      {
        name: 'Images',
        status: issues.hasImages ? '✅ Present' : '⚠️ No Images Found',
        explanation: issues.hasImages
          ? 'Your website has images, which is good for engagement and visual appeal.'
          : `Your website (${websiteName}) has no images. Images make your website more engaging and help with user retention.`,
        disadvantage: issues.hasImages
          ? 'Ensure all your images have descriptive alt text for better SEO and accessibility.'
          : '❌ DISADVANTAGE: Your website looks boring and unprofessional. Visitors will leave quickly, and Google will rank you lower because of high bounce rates.'
      },
      {
        name: 'Social Media Links',
        status: issues.hasSocialLinks ? '✅ Present' : '❌ Missing',
        explanation: issues.hasSocialLinks
          ? 'Your website has social media links, which helps build trust and engagement.'
          : `Your website (${websiteName}) has no social media links. This is a missed opportunity to connect with your audience.`,
        disadvantage: issues.hasSocialLinks
          ? 'Ensure your social links are visible and open in new tabs.'
          : '❌ DISADVANTAGE: You are missing out on free traffic from social media. Customers will trust you less because they can\'t verify your business presence on social platforms.'
      },
      {
        name: 'Phone Number',
        status: issues.phoneNumbers && issues.phoneNumbers.length > 0 ? '✅ Found' : '❌ Not Found',
        explanation: issues.phoneNumbers && issues.phoneNumbers.length > 0
          ? `Your phone number ${issues.phoneNumbers[0]} was found on your website.`
          : `Your website (${websiteName}) has no phone number visible. Customers want to contact you easily.`,
        disadvantage: issues.phoneNumbers && issues.phoneNumbers.length > 0
          ? 'Make sure your phone number is visible and clickable on mobile devices.'
          : '❌ DISADVANTAGE: Potential customers cannot easily contact you. You are losing business because people will call your competitors instead.'
      },
      {
        name: 'Word Count / Content',
        status: issues.wordCount > 300 ? '✅ Good' : issues.wordCount > 100 ? '⚠️ Average' : '❌ Low',
        explanation: issues.wordCount > 300
          ? `Your website has ${issues.wordCount} words, which is good for SEO.`
          : issues.wordCount > 100
          ? `Your website has ${issues.wordCount} words. This is average but could be improved.`
          : `Your website (${websiteName}) has only ${issues.wordCount} words. This is very low and hurts your SEO.`,
        disadvantage: issues.wordCount > 300
          ? 'Continue adding valuable content to keep your website fresh and relevant.'
          : '❌ DISADVANTAGE: Search engines consider thin content as low quality. Your website will not rank because Google sees it as having little value to users.'
      },
      {
        name: 'URL Structure',
        status: '⚠️ Needs Review',
        explanation: `Your website (${websiteName}) should have clean, descriptive URLs. URLs should be short and include keywords. Example: yourwebsite.com/contact-us instead of yourwebsite.com/page?id=123`,
        disadvantage: '❌ DISADVANTAGE: Poor URL structure makes it hard for Google to understand your pages. It also makes it difficult for users to remember and share your links.'
      },
      {
        name: 'Core Web Vitals',
        status: '⚠️ Needs Review',
        explanation: `Your website (${websiteName}) needs to load fast and be responsive. Core Web Vitals measure your site's speed, responsiveness, and visual stability. Google uses these as ranking factors.`,
        disadvantage: '❌ DISADVANTAGE: Slow websites drive visitors away. For every second of delay, you lose 7% of your conversions. Your competitors with faster websites will rank higher.'
      },
      {
        name: 'Schema Markup (Structured Data)',
        status: '⚠️ Needs Review',
        explanation: `Your website (${websiteName}) should have Schema markup. This is code that helps Google understand your content better and show rich results (like star ratings, event dates, or FAQs) in search results.`,
        disadvantage: '❌ DISADVANTAGE: Without Schema markup, your website will not appear with rich results on Google. Your competitors using Schema will get more clicks and higher rankings.'
      },
      {
        name: 'Robots.txt',
        status: '⚠️ Needs Review',
        explanation: `Your website (${websiteName}) should have a robots.txt file. This tells Google which pages to crawl and which to ignore.`,
        disadvantage: '❌ DISADVANTAGE: Without proper robots.txt, Google might waste time crawling unimportant pages, or worse, might not crawl your important pages at all.'
      },
      {
        name: 'XML Sitemap',
        status: '⚠️ Needs Review',
        explanation: `Your website (${websiteName}) should have an XML sitemap. This is like a roadmap that tells Google about all the pages on your website.`,
        disadvantage: '❌ DISADVANTAGE: Without a sitemap, Google might not find all your pages. Some of your important content could remain invisible in search results.'
      }
    ];
  };

  const generateBusinessMessage = (issues: any, url: string) => {
    const websiteName = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const missingItems = [];
    
    if (!issues.title || issues.title === 'Missing Title Tag') missingItems.push('Meta Title Tag');
    if (!issues.metaDescription || issues.metaDescription === 'Missing Meta Description') missingItems.push('Meta Description');
    if (!issues.hasH1) missingItems.push('H1 Heading');
    if (!issues.hasSocialLinks) missingItems.push('Social Media Links');
    if (!issues.phoneNumbers || issues.phoneNumbers.length === 0) missingItems.push('Phone Number');
    if (issues.wordCount < 100) missingItems.push('Quality Content');

    let message = `Dear Business Owner of ${websiteName.toUpperCase()},\n\n`;
    message += `I ran a free SEO audit on your website and found the following issues that are hurting your business:\n\n`;

    if (missingItems.length > 0) {
      message += `❌ Missing/Weak Elements:\n`;
      missingItems.forEach(item => {
        message += `  • ${item}\n`;
      });
      message += `\n`;
    }

    message += `These issues are costing you:\n`;
    message += `  • Lost visitors who can't find you on Google\n`;
    message += `  • Lost customers who can't contact you\n`;
    message += `  • Lower rankings than your competitors\n`;
    message += `  • Reduced trust and credibility\n\n`;

    message += `💡 The good news is that all these issues can be fixed quickly. I specialize in helping businesses like yours fix these exact problems and get results.\n\n`;

    message += `📞 Contact me today for a FREE consultation:\n`;
    message += `   Emmanuel Adekunle Peace\n`;
    message += `   +234 703 297 7572\n\n`;

    message += `Let's get your website ranking higher and bringing in more customers!`;

    return message;
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <img 
              src="/eapeace_logo.png" 
              alt="BizReach Logo" 
              className="w-20 h-20 md:w-24 md:h-24 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              BizReach
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get a FREE comprehensive SEO audit and discover what's missing on your website
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 mb-8 border border-gray-100">
          <form onSubmit={handleAudit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Website URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="e.g., yourwebsite.com"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning...
                    </span>
                  ) : (
                    '🔍 Run Free Audit'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Free comprehensive SEO audit. Get a detailed report of what's missing on your website.
              </p>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">📊 SEO Audit Report</h2>
                  <p className="text-sm text-gray-500 mt-1">{result.url}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                  Analysis Complete
                </span>
              </div>
              
              <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 rounded-r-lg mb-6">
                <h3 className="font-semibold text-yellow-800">📋 Main Issue Detected</h3>
                <p className="text-yellow-700">{result.insight}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">🔍 SEO Checklist & Analysis</h3>
                <div className="space-y-4">
                  {generateChecklist(result.issues, result.url).map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{item.name}</span>
                        <span className={`text-sm font-semibold ${
                          item.status.includes('✅') ? 'text-green-600' : 
                          item.status.includes('⚠️') ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.explanation}</p>
                      <p className="text-sm font-medium text-red-600">{item.disadvantage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {result.issues.phoneNumbers.length > 0 && (
                <div className="border-l-4 border-green-400 bg-green-50 p-4 rounded-r-lg mb-6">
                  <h3 className="font-semibold text-green-800">📱 Phone Numbers Found</h3>
                  <ul className="text-green-700 space-y-1 mt-2">
                    {result.issues.phoneNumbers.map((phone: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {phone}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="border-l-4 border-purple-400 bg-purple-50 p-4 rounded-r-lg mb-6">
                <h3 className="font-semibold text-purple-800">📧 Message to the Business Owner</h3>
                <div className="text-purple-700 mt-2 whitespace-pre-line font-sans text-sm">
                  {generateBusinessMessage(result.issues, result.url)}
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 md:p-8 border border-blue-400 text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">🚀 Get Your Website Fixed Today!</h3>
                <p className="text-blue-100 mb-4">
                  Your website is losing customers every day because of these issues. I can help you fix everything and start getting more traffic and sales.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                    <p className="text-sm text-blue-200">📞 Contact Me</p>
                    <p className="text-lg font-bold">Emmanuel Adekunle Peace</p>
                    <p className="text-lg font-bold">+234 703 297 7572</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                    <p className="text-sm text-blue-200">💡 What I Offer</p>
                    <ul className="text-sm text-left">
                      <li>✅ Complete SEO Optimization</li>
                      <li>✅ Website Redesign</li>
                      <li>✅ Content Strategy</li>
                      <li>✅ Google Ranking Improvement</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href="tel:+2347032977572"
                    className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition shadow-lg"
                  >
                    📞 Call Now for a Free Consultation
                  </a>
                </div>
                <p className="text-xs text-blue-200 mt-3">
                  Limited slots available. Contact me today to get your website ranked #1 on Google!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}