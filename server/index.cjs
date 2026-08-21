const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'nova360_digital_secret_2026';
const TOKEN_EXPIRY = '24h';
const MAX_ADMIN_USERS = parseInt(process.env.MAX_ADMIN_USERS || '4', 10);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'digital.db');
const db = new sqlite3.Database(dbPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY
  });
}

function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    meta_title TEXT,
    meta_description TEXT,
    seo_title TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    features TEXT,
    image TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS blog_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category TEXT,
    tags TEXT,
    author TEXT,
    featured_image TEXT,
    status TEXT DEFAULT 'draft',
    seo_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    image TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT,
    size INTEGER,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS seo_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page TEXT UNIQUE NOT NULL,
    seo_title TEXT,
    meta_description TEXT,
    keywords TEXT,
    og_image TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS content_calendar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    content_type TEXT NOT NULL,
    caption TEXT,
    hashtags TEXT,
    scheduled_date TEXT,
    scheduled_time TEXT,
    campaign TEXT,
    status TEXT DEFAULT 'idea',
    media_url TEXT,
    notes TEXT,
    cta TEXT,
    target_audience TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err || !row || row.count === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      db.run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@nova360digital.com', hashedPassword, 'admin']
      );
    }
  });

  db.get('SELECT COUNT(*) as count FROM pages', (err, row) => {
    if (err || !row || row.count === 0) {
      const pages = [
        ['home', 'Home', '<h1>Welcome to Nova360 Digital</h1><p>Your premier digital marketing partner.</p>', 'Nova360 Digital - Premier Digital Marketing Agency', 'We help brands grow through strategic digital marketing.', 'home'],
        ['about', 'About Us', '<h1>About Nova360 Digital</h1><p>We are a team of passionate digital marketers.</p>', 'About Nova360 Digital', 'Learn about our story, mission, and vision.', 'about'],
        ['services', 'Services', '<h1>Our Services</h1><p>Comprehensive digital marketing solutions.</p>', 'Digital Marketing Services - Nova360', 'Explore our range of digital marketing services.', 'services'],
        ['contact', 'Contact Us', '<h1>Contact Us</h1><p>Get in touch with our team.</p>', 'Contact Nova360 Digital', 'Reach out for a consultation.', 'contact']
      ];
      const stmt = db.prepare('INSERT INTO pages (slug, title, content, meta_title, meta_description, seo_title) VALUES (?, ?, ?, ?, ?, ?)');
      pages.forEach(p => stmt.run(p));
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM services', (err, row) => {
    if (err || !row || row.count === 0) {
      const services = [
        ['Social Media Marketing', 'Build your brand presence across all major social platforms with data-driven strategies.', '["Content Strategy","Community Management","Paid Social Campaigns","Analytics & Reporting"]', 'social-media.jpg', 1],
        ['Search Engine Optimization', 'Improve your search rankings and drive organic traffic with proven SEO techniques.', '["Keyword Research","On-Page SEO","Technical SEO","Link Building"]', 'seo.jpg', 1],
        ['Content Marketing', 'Engage your audience with compelling content that converts visitors into customers.', '["Blog Writing","Video Production","Infographics","Email Newsletters"]', 'content.jpg', 1],
        ['Brand Strategy', 'Define your brand identity and positioning to stand out in the digital landscape.', '["Brand Identity","Market Research","Competitive Analysis","Brand Guidelines"]', 'brand.jpg', 1]
      ];
      const stmt = db.prepare('INSERT INTO services (title, description, features, image, is_active) VALUES (?, ?, ?, ?, ?)');
      services.forEach(s => stmt.run(s));
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM blog_posts', (err, row) => {
    if (err || !row || row.count === 0) {
      const now = new Date().toISOString();
      const posts = [
        [
          'The Future of Digital Marketing in 2026',
          'future-of-digital-marketing-2026',
          '<h2>The Digital Landscape Is Shifting Beneath Our Feet</h2><p>Digital marketing in 2026 looks fundamentally different from even just a few years ago. The convergence of artificial intelligence, privacy-first analytics, and immersive social experiences has created a new playground for brands willing to adapt. The organizations that thrive will not be those with the biggest budgets, but those with the sharpest strategies and the deepest commitment to authentic audience relationships.</p><h2>AI-Powered Personalization at Scale</h2><p>Artificial intelligence is no longer a futuristic concept in marketing — it is the present reality. Machine learning algorithms now analyze user behavior patterns in real time, allowing brands to deliver hyper-relevant content without manual intervention. This means a visitor to your website sees a completely tailored experience based on their previous interactions, browsing history, and inferred preferences.</p><p>However, personalization comes with responsibility. Consumers are increasingly aware of how their data is used. The brands that win trust are those that are transparent about their data practices while still delivering relevant experiences. Privacy-first personalization — where value is exchanged for data — is becoming the standard approach.</p><h2>Social Media Evolution: From Feed to Ecosystem</h2><p>Social platforms are no longer just content feeds; they are full-fledged ecosystems. Instagram and TikTok have expanded into social commerce, allowing users to purchase products without leaving the app. LinkedIn has become a professional content platform rivaling traditional media. YouTube Shorts are competing directly with TikTok for short-form video dominance.</p><p>For marketers, this means diversifying content strategies. A single piece of content can no longer be repurposed identically across all platforms. Each channel now demands a unique format, tone, and cadence. The brands that invest in platform-specific content teams are seeing significantly higher engagement rates than those using a one-size-fits-all approach.</p><h2>Search Is Changing: AI and Visual Discovery</h2><p>Traditional SEO is evolving alongside search engine capabilities. Google\'s AI-powered overviews and Bing\'s integration with OpenAI have changed how users discover content. Voice search continues to grow, especially in Africa where mobile penetration exceeds desktop usage in many markets. Visual search — using images instead of text queries — is gaining traction on platforms like Google Lens and Pinterest.</p><p>To stay visible, brands must optimize for multiple search modalities. This means structured data for AI comprehension, natural language content for voice search, and high-quality imagery for visual discovery. Technical SEO remains the foundation, but the layer of content strategy on top must adapt to these new search behaviors.</p><h2>Building Authentic Community Connections</h2><p>Perhaps the most significant trend is the shift from broadcasting to conversation. Modern audiences can detect inauthentic marketing from a mile away. The brands that build genuine communities — through responsive social media management, user-generated content campaigns, and transparent communication — create advocates, not just customers.</p><p>At Nova360 Digital, we help businesses navigate these changes by combining data-driven insights with creative storytelling. Our team stays ahead of platform algorithm changes, emerging technologies, and consumer behavior shifts so that our clients can focus on what they do best: running their businesses.</p><p><strong>Ready to future-proof your digital marketing?</strong> <a href="/contact">Contact Nova360 Digital</a> for a consultation.</p>',
          'Explore the key trends shaping digital marketing in 2026 and how businesses can stay ahead of the curve with AI, social commerce, and privacy-first strategies.',
          'Trends',
          '["AI","digital marketing","2026 trends","personalization","social commerce"]',
          'Nova360 Team',
          'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80',
          'published',
          'The Future of Digital Marketing in 2026',
          'Learn about digital marketing trends for 2026 including AI personalization, social commerce, and privacy-first analytics.',
          'digital marketing, AI, personalization, 2026 trends',
          now
        ],
        [
          '10 SEO Strategies That Actually Work in 2026',
          'seo-strategies-that-actually-work-2026',
          '<h2>Why Most SEO Advice Is Outdated</h2><p>Search engine optimization has evolved dramatically over the past few years. The tactics that guaranteed first-page rankings in 2018 — keyword stuffing, exact-match domains, and mass link building — can now harm your website rather than help it. Search engines have become sophisticated enough to understand context, user intent, and content quality.</p><p>This article presents ten strategies that continue to deliver measurable results in the current landscape. These are not theoretical concepts; they are actionable techniques that our team at Nova360 Digital applies for clients across Kenya and beyond.</p><h2>1. Optimize for User Intent, Not Just Keywords</h2><p>Modern search engines prioritize pages that satisfy user intent over pages that simply contain target keywords. When someone searches for "best digital marketing agency in Nairobi," they are likely comparing options, not just looking for a definition. Your content should address that intent directly — with specific proof points, client testimonials, and clear calls to action.</p><h2>2. Earn Featured Snippets with Structured Answers</h2><p>Featured snippets appear above traditional organic results and capture significant click-through rates. To earn them, structure your content with clear question-and-answer formats. Use H2 and H3 headings that mirror common questions. Provide concise, authoritative answers in the first paragraph. Bullet points and numbered lists are particularly effective for snippet eligibility.</p><h2>3. Build Quality Backlinks Through Relationship Marketing</h2><p>Link building is not dead, but the approach has changed. Mass outreach and link exchanges are penalized by search engines. Instead, focus on building genuine relationships with industry publications, complementary businesses, and local directories. Guest contributions, expert roundups, and original research studies naturally attract high-quality backlinks.</p><h2>4. Improve Core Web Vitals for Better Rankings</h2><p>Google\'s Core Web Vitals — Largest Contentful Paint, First Input Delay, and Cumulative Layout Shift — are direct ranking factors. Websites that load quickly, respond immediately to user interaction, and maintain visual stability outperform slower competitors. Optimize images, minimize JavaScript bundles, and use a content delivery network to improve these metrics.</p><h2>5. Create Comprehensive Cornerstone Content</h2><p>Search engines reward depth. A single 3,000-word guide that thoroughly covers a topic often outperforms ten shorter pages on related subtopics. Identify your cornerstone topics — the subjects central to your business — and create definitive resources. Update these resources regularly to keep them current and relevant.</p><h2>6. Leverage Local SEO for Geographic Visibility</h2><p>For businesses serving specific regions, local SEO is essential. Claim and optimize your Google Business Profile, ensure consistent NAP (Name, Address, Phone) information across directories, and encourage satisfied customers to leave reviews. Local pack rankings drive significant foot traffic for physical businesses.</p><h2>7. Implement Schema Markup for Rich Results</h2><p>Schema markup helps search engines understand your content and can result in rich snippets — enhanced search results with star ratings, pricing information, event dates, and more. While schema does not directly boost rankings, it significantly improves click-through rates from search results pages.</p><h2>8. Optimize for Voice and Mobile Search</h2><p>Voice search queries tend to be longer and more conversational than typed queries. Optimize for natural language by including question-based headings and providing direct answers. Ensure your website is fully responsive and loads quickly on mobile networks, as the majority of searches in many African markets now happen on mobile devices.</p><h2>9. Maintain Technical SEO Health</h2><p>Technical SEO forms the foundation of all other optimization efforts. Regularly audit your site for crawl errors, broken links, duplicate content, and indexation issues. Use XML sitemaps, robots.txt files, and structured data correctly. A technically sound website ensures that search engines can find and understand your content.</p><h2>10. Track the Right Metrics</h2><p>Focus on meaningful metrics rather than vanity numbers. Organic traffic growth, conversion rates, and keyword position changes for terms that drive revenue are more important than raw page one rankings. Set up proper tracking in Google Analytics and Search Console, and review your data monthly to identify trends and opportunities.</p><p><strong>Ready to improve your search visibility?</strong> <a href="/contact">Get in touch</a> with Nova360 Digital for a free SEO audit.</p>',
          'Proven SEO strategies to improve your search rankings and drive organic traffic in 2026. Includes user intent, featured snippets, Core Web Vitals, and local SEO.',
          'SEO',
          '["SEO","search engine optimization","ranking","Core Web Vitals","local SEO"]',
          'Nova360 Team',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
          'published',
          '10 SEO Strategies That Actually Work in 2026',
          'Proven SEO strategies for better search rankings including featured snippets, Core Web Vitals, and local SEO optimization.',
          'SEO, search engine, ranking, Core Web Vitals, local SEO',
          now
        ],
        [
          'How to Build a Winning Social Media Content Calendar',
          'build-winning-social-media-content-calendar',
          '<h2>Why Your Brand Needs a Content Calendar</h2><p>A content calendar is not just an organizational tool — it is a strategic asset that ensures consistency, aligns your team, and helps you plan campaigns around key business dates. Without a calendar, social media becomes reactive rather than intentional. Posts are created at the last minute, messaging is inconsistent, and opportunities to capitalize on trending moments are missed.</p><p>The most successful brands on social media plan weeks or even months ahead. They know what they are publishing, when they are publishing it, and why. This article walks you through the process of building a content calendar that drives real engagement and supports your broader marketing objectives.</p><h2>Step 1: Audit Your Current Presence</h2><p>Before building a new calendar, understand what you already have. Review your past six months of social media performance. Which posts performed best? Which platforms drive the most engagement? What content types — images, videos, carousels, stories — resonate most with your audience?</p><p>Use platform-native analytics tools and third-party dashboards to gather this data. Look for patterns in posting times, content themes, and audience demographics. This audit becomes the foundation of your calendar strategy.</p><h2>Step 2: Define Your Content Pillars</h2><p>Content pillars are the main themes that define your brand\'s social media presence. For a digital marketing agency, these might include educational content, client success stories, team spotlights, industry news commentary, and promotional offers. Each pillar should align with your audience\'s interests and your business goals.</p><p>Limit yourself to three to five pillars. Too many themes dilute your message; too few make your feed repetitive. Assign each pillar a rough percentage of your total content — for example, 40 percent educational, 20 percent promotional, 20 percent community-focused, and 20 percent entertainment.</p><h2>Step 3: Map Key Dates and Campaigns</h2><p>Identify the dates that matter to your business and industry. These include product launches, seasonal promotions, industry events, holidays, and cultural moments relevant to your audience. Map these dates on a monthly or quarterly view and assign content themes around them.</p><p>For example, a digital marketing agency might plan content around "Digital Marketing Month" in October, Black Friday in November, and New Year strategy sessions in January. Each campaign should have a clear objective, key message, and success metric.</p><h2>Step 4: Choose the Right Format for Each Platform</h2><p>Each social platform has its own content preferences. Instagram rewards high-quality visuals and Reels. LinkedIn performs best with professional insights and long-form articles. TikTok thrives on authentic, trending content. Facebook supports community discussions and events. YouTube is the platform for deep-dive tutorials and vlogs.</p><p>Your calendar should reflect these differences. A single campaign idea might be expressed as a carousel post on Instagram, a short video on TikTok, a detailed article on LinkedIn, and a discussion prompt on Facebook. Repurposing content across platforms saves time while maximizing reach.</p><h2>Step 5: Establish a Posting Cadence</h2><p>Consistency matters more than frequency. It is better to post three high-quality times per week than to post low-quality content daily. Determine the optimal posting frequency for each platform based on your audience\'s behavior and your team\'s capacity. Create a realistic schedule that you can maintain over the long term.</p><p>Use scheduling tools like Buffer, Hootsuite, or Later to automate publishing. These tools allow you to batch-create content, schedule it for optimal times, and maintain a consistent presence even during busy periods.</p><h2>Step 6: Measure, Learn, and Iterate</h2><p>A content calendar is a living document, not a static plan. Review your performance metrics weekly and adjust your calendar accordingly. If a particular content type or posting time drives exceptional engagement, incorporate more of it. If a theme falls flat, replace it with something else.</p><p>At Nova360 Digital, we manage content calendars for clients across multiple industries. Our data-driven approach ensures that every piece of content serves a purpose and contributes to measurable business outcomes. <a href="/contact">Contact us</a> to learn how we can help your brand build a winning social media strategy.</p>',
          'Learn how to create an effective social media content calendar that drives engagement. Covers content pillars, platform strategy, posting cadence, and performance measurement.',
          'Social Media',
          '["social media","content calendar","planning","content strategy","engagement"]',
          'Nova360 Team',
          'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80',
          'published',
          'How to Build a Winning Social Media Content Calendar',
          'A complete guide to creating a social media content calendar that drives engagement and supports your marketing goals.',
          'social media, content calendar, planning, content strategy',
          now
        ]
      ];
      const stmt = db.prepare('INSERT INTO blog_posts (title, slug, content, excerpt, category, tags, author, featured_image, status, seo_title, meta_description, keywords, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      posts.forEach(post => stmt.run(post));
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM testimonials', (err, row) => {
    if (err || !row || row.count === 0) {
      const testimonials = [
        ['Sarah Kamau', 'CEO, TechStart Kenya', 'Nova360 Digital transformed our online presence. Our leads increased by 300% in just three months.', 'testimonial-1.jpg', 1],
        ['James Ochieng', 'Marketing Director, FreshGrocers', 'The team at Nova360 understands local markets. Their social media strategies are top-notch.', 'testimonial-2.jpg', 1],
        ['Grace Wanjiku', 'Founder, StyleHub', 'Working with Nova360 was a game-changer. They rebuilt our brand and our website traffic has never been better.', 'testimonial-3.jpg', 1]
      ];
      const stmt = db.prepare('INSERT INTO testimonials (name, role, content, image, is_active) VALUES (?, ?, ?, ?, ?)');
      testimonials.forEach(t => stmt.run(t));
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM social_links', (err, row) => {
    if (err || !row || row.count === 0) {
      const links = [
        ['Instagram', 'https://instagram.com/nova360digital', 1],
        ['Facebook', 'https://facebook.com/nova360digital', 1],
        ['LinkedIn', 'https://linkedin.com/company/nova360digital', 1],
        ['TikTok', 'https://tiktok.com/@nova360digital', 1],
        ['YouTube', 'https://youtube.com/@nova360digital', 1]
      ];
      const stmt = db.prepare('INSERT INTO social_links (platform, url, is_active) VALUES (?, ?, ?)');
      links.forEach(l => stmt.run(l));
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM seo_settings', (err, row) => {
    if (err || !row || row.count === 0) {
      const settings = [
        ['home', 'Nova360 Digital - Premier Digital Marketing Agency', 'We help brands grow through strategic digital marketing.', 'digital marketing, brand growth, social media, SEO', ''],
        ['about', 'About Nova360 Digital', 'Learn about our story, mission, and vision.', 'about Nova360, digital agency, brand story', ''],
        ['services', 'Digital Marketing Services - Nova360', 'Explore our range of digital marketing services.', 'digital marketing services, SEO, social media, content marketing', ''],
        ['blog', 'Digital Marketing Blog - Nova360', 'Insights, tips, and strategies for modern marketers.', 'digital marketing blog, marketing tips, SEO, social media', ''],
        ['contact', 'Contact Nova360 Digital', 'Reach out for a consultation.', 'contact Nova360, digital marketing consultation', '']
      ];
      const stmt = db.prepare('INSERT INTO seo_settings (page, seo_title, meta_description, keywords, og_image) VALUES (?, ?, ?, ?, ?)');
      settings.forEach(s => stmt.run(s));
      stmt.finalize();
    }
  });

  db.get('SELECT COUNT(*) as count FROM content_calendar', (err, row) => {
    if (err || !row || row.count === 0) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const baseDate = `${yyyy}-${mm}-${dd}`;
      
      const calendarItems = [
        ['Monday Morning Motivation', 'Instagram', 'Post', 'Start your week with purpose!', '#MondayMotivation #DigitalMarketing', baseDate, '09:00', 'Q1 Brand Awareness', 'scheduled', '', 'Engage with comments', 'Follow for more tips', 'Small Business Owners'],
        ['SEO Tips Tuesday', 'LinkedIn', 'Post', '5 SEO tips that will boost your rankings this week.', '#SEO #SearchEngineOptimization #Marketing', baseDate, '10:00', 'Q1 Brand Awareness', 'scheduled', '', 'Share in comments', 'Learn more', 'Marketing Professionals'],
        ['Client Success Story', 'Facebook', 'Post', 'See how we helped TechStart Kenya grow 300%.', '#SuccessStory #ClientLove #DigitalMarketing', baseDate, '14:00', 'Q1 Brand Awareness', 'scheduled', '', 'Tag a friend who needs this', 'Get started', 'Entrepreneurs'],
        ['Quick Reel: Behind the Scenes', 'Instagram', 'Reel', 'A day in the life at Nova360 Digital.', '#BehindTheScenes #AgencyLife #Reels', baseDate, '16:00', 'Q1 Brand Awareness', 'scheduled', '', 'Follow our journey', 'Join us', 'Young Professionals'],
        ['Wednesday Wisdom', 'TikTok', 'Video', 'Why your brand needs a content calendar.', '#MarketingTips #ContentCalendar #SmallBiz', baseDate, '11:00', 'Q1 Brand Awareness', 'scheduled', '', 'Duet with your answer', 'Follow for more', 'Content Creators'],
        ['Industry News Roundup', 'LinkedIn', 'Post', 'Top digital marketing news this week.', '#MarketingNews #IndustryUpdate #LinkedIn', baseDate, '08:00', 'Q1 Brand Awareness', 'scheduled', '', 'Comment your thoughts', 'Stay informed', 'Business Owners'],
        ['Fun Friday Poll', 'Instagram', 'Story', 'Which platform do you prefer for ads?', '#Poll #SocialMedia #Marketing', baseDate, '12:00', 'Q1 Engagement', 'scheduled', '', 'Vote now', 'Follow', 'Social Media Managers']
      ];
      const stmt = db.prepare('INSERT INTO content_calendar (title, platform, content_type, caption, hashtags, scheduled_date, scheduled_time, campaign, status, media_url, notes, cta, target_audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      calendarItems.forEach(item => stmt.run(item));
      stmt.finalize();
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin'], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (row.count >= MAX_ADMIN_USERS) {
      return res.status(403).json({ error: 'Administrator account limit reached. Maximum allowed: ' + MAX_ADMIN_USERS });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'admin'],
      function (err) {
        if (err) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        res.status(201).json({ message: 'Registration successful', id: this.lastID, name, email });
      }
    );
  });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  db.get('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });
});

app.get('/api/pages', (req, res) => {
  db.all('SELECT * FROM pages ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/pages/:slug', (req, res) => {
  db.get('SELECT * FROM pages WHERE slug = ?', [req.params.slug], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Page not found' });
    res.json(row);
  });
});

app.put('/api/pages/:id', authenticate, adminOnly, (req, res) => {
  const { title, content, meta_title, meta_description } = req.body;
  db.run(
    'UPDATE pages SET title = ?, content = ?, meta_title = ?, meta_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, content, meta_title, meta_description, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: req.params.id, title, content, meta_title, meta_description });
    }
  );
});

app.get('/api/services', (req, res) => {
  db.all('SELECT * FROM services WHERE is_active = 1 ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/services/all', authenticate, adminOnly, (req, res) => {
  db.all('SELECT * FROM services ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/services', authenticate, adminOnly, (req, res) => {
  const { title, description, features, image } = req.body;
  db.run(
    'INSERT INTO services (title, description, features, image, is_active) VALUES (?, ?, ?, ?, ?)',
    [title, description, features, image, 1],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, description, features, image, is_active: 1 });
    }
  );
});

app.put('/api/services/:id', authenticate, adminOnly, (req, res) => {
  const { title, description, features, image, is_active } = req.body;
  db.run(
    'UPDATE services SET title = ?, description = ?, features = ?, image = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, description, features, image, is_active ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: req.params.id, title, description, features, image, is_active });
    }
  );
});

app.delete('/api/services/:id', authenticate, adminOnly, (req, res) => {
  db.run('DELETE FROM services WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(204).json({ success: true });
  });
});

app.get('/api/blog', (req, res) => {
  const status = req.query.status || 'published';
  db.all('SELECT * FROM blog_posts WHERE status = ? ORDER BY published_at DESC', [status], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/blog/:slug', (req, res) => {
  db.get('SELECT * FROM blog_posts WHERE slug = ?', [req.params.slug], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Post not found' });
    res.json(row);
  });
});

app.get('/api/blog/all', authenticate, adminOnly, (req, res) => {
  db.all('SELECT * FROM blog_posts ORDER BY updated_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/blog', authenticate, adminOnly, (req, res) => {
  const { title, slug, content, excerpt, category, tags, author, featured_image, status, seo_title, meta_description, keywords } = req.body;
  const now = new Date().toISOString();
  const published_at = status === 'published' ? now : null;

  db.run(
    'INSERT INTO blog_posts (title, slug, content, excerpt, category, tags, author, featured_image, status, seo_title, meta_description, keywords, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, slug, content, excerpt, category, tags, author, featured_image, status || 'draft', seo_title, meta_description, keywords, published_at],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, slug, status });
    }
  );
});

app.put('/api/blog/:id', authenticate, adminOnly, (req, res) => {
  const { title, slug, content, excerpt, category, tags, author, featured_image, status, seo_title, meta_description, keywords } = req.body;
  const now = new Date().toISOString();
  let published_at = null;

  db.get('SELECT published_at FROM blog_posts WHERE id = ?', [req.params.id], (err, post) => {
    if (err || !post) return res.status(404).json({ error: 'Post not found' });
    
    if (status === 'published' && !post.published_at) {
      published_at = now;
    } else {
      published_at = post.published_at;
    }

    db.run(
      'UPDATE blog_posts SET title = ?, slug = ?, content = ?, excerpt = ?, category = ?, tags = ?, author = ?, featured_image = ?, status = ?, seo_title = ?, meta_description = ?, keywords = ?, published_at = ?, updated_at = ? WHERE id = ?',
      [title, slug, content, excerpt, category, tags, author, featured_image, status, seo_title, meta_description, keywords, published_at, now, req.params.id],
      function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: req.params.id, title, slug, status });
      }
    );
  });
});

app.delete('/api/blog/:id', authenticate, adminOnly, (req, res) => {
  db.run('DELETE FROM blog_posts WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(204).json({ success: true });
  });
});

app.get('/api/testimonials', (req, res) => {
  db.all('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/testimonials/all', authenticate, adminOnly, (req, res) => {
  db.all('SELECT * FROM testimonials ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/testimonials', authenticate, adminOnly, (req, res) => {
  const { name, role, content, image } = req.body;
  db.run(
    'INSERT INTO testimonials (name, role, content, image, is_active) VALUES (?, ?, ?, ?, ?)',
    [name, role, content, image, 1],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, role, content, image, is_active: 1 });
    }
  );
});

app.put('/api/testimonials/:id', authenticate, adminOnly, (req, res) => {
  const { name, role, content, image, is_active } = req.body;
  db.run(
    'UPDATE testimonials SET name = ?, role = ?, content = ?, image = ?, is_active = ? WHERE id = ?',
    [name, role, content, image, is_active ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: req.params.id, name, role, content, image, is_active });
    }
  );
});

app.delete('/api/testimonials/:id', authenticate, adminOnly, (req, res) => {
  db.run('DELETE FROM testimonials WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(204).json({ success: true });
  });
});

app.get('/api/media', authenticate, (req, res) => {
  db.all('SELECT * FROM media ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/media/upload', authenticate, adminOnly, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const mediaUrl = `/uploads/${req.file.filename}`;
  db.run(
    'INSERT INTO media (filename, original_name, mime_type, size, url) VALUES (?, ?, ?, ?, ?)',
    [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, mediaUrl],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({
        id: this.lastID,
        filename: req.file.filename,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        size: req.file.size,
        url: mediaUrl
      });
    }
  );
});

app.delete('/api/media/:id', authenticate, adminOnly, (req, res) => {
  db.get('SELECT * FROM media WHERE id = ?', [req.params.id], (err, media) => {
    if (err || !media) return res.status(404).json({ error: 'Media not found' });

    const filePath = path.join(uploadsDir, media.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    db.run('DELETE FROM media WHERE id = ?', [req.params.id], function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(204).json({ success: true });
    });
  });
});

app.get('/api/social-links', (req, res) => {
  db.all('SELECT * FROM social_links WHERE is_active = 1 ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/social-links', authenticate, adminOnly, (req, res) => {
  const links = req.body;
  if (!Array.isArray(links)) {
    return res.status(400).json({ error: 'Expected an array of links' });
  }

  db.serialize(() => {
    db.run('DELETE FROM social_links');
    const stmt = db.prepare('INSERT INTO social_links (platform, url, is_active) VALUES (?, ?, ?)');
    links.forEach(link => {
      stmt.run(link.platform, link.url, link.is_active ? 1 : 0);
    });
    stmt.finalize();
  });

  res.json({ success: true });
});

app.get('/api/seo', (req, res) => {
  db.all('SELECT * FROM seo_settings ORDER BY page ASC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/seo/:page', authenticate, adminOnly, (req, res) => {
  const { seo_title, meta_description, keywords, og_image } = req.body;
  db.run(
    'UPDATE seo_settings SET seo_title = ?, meta_description = ?, keywords = ?, og_image = ?, updated_at = CURRENT_TIMESTAMP WHERE page = ?',
    [seo_title, meta_description, keywords, og_image, req.params.page],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ page: req.params.page, seo_title, meta_description, keywords, og_image });
    }
  );
});

app.get('/api/calendar', authenticate, (req, res) => {
  const { status, platform, campaign } = req.query;
  let query = 'SELECT * FROM content_calendar WHERE 1=1';
  const params = [];

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (platform) {
    query += ' AND platform = ?';
    params.push(platform);
  }
  if (campaign) {
    query += ' AND campaign = ?';
    params.push(campaign);
  }

  query += ' ORDER BY scheduled_date DESC, scheduled_time DESC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/calendar', authenticate, adminOnly, (req, res) => {
  const { title, platform, content_type, caption, hashtags, scheduled_date, scheduled_time, campaign, status, media_url, notes, cta, target_audience } = req.body;
  db.run(
    'INSERT INTO content_calendar (title, platform, content_type, caption, hashtags, scheduled_date, scheduled_time, campaign, status, media_url, notes, cta, target_audience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, platform, content_type, caption, hashtags, scheduled_date, scheduled_time, campaign, status || 'idea', media_url, notes, cta, target_audience],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID, title, platform, content_type, status });
    }
  );
});

app.put('/api/calendar/:id', authenticate, adminOnly, (req, res) => {
  const { title, platform, content_type, caption, hashtags, scheduled_date, scheduled_time, campaign, status, media_url, notes, cta, target_audience } = req.body;
  db.run(
    'UPDATE content_calendar SET title = ?, platform = ?, content_type = ?, caption = ?, hashtags = ?, scheduled_date = ?, scheduled_time = ?, campaign = ?, status = ?, media_url = ?, notes = ?, cta = ?, target_audience = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [title, platform, content_type, caption, hashtags, scheduled_date, scheduled_time, campaign, status, media_url, notes, cta, target_audience, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: req.params.id, title, platform, content_type, status });
    }
  );
});

app.delete('/api/calendar/:id', authenticate, adminOnly, (req, res) => {
  db.run('DELETE FROM content_calendar WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(204).json({ success: true });
  });
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  const now = new Date().toISOString();

  db.run(
    'INSERT INTO contact_submissions (name, email, phone, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, phone, message, 'new', now],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, email, message, status: 'new' });
    }
  );
});

app.get('/api/contact', authenticate, adminOnly, (req, res) => {
  db.all('SELECT * FROM contact_submissions ORDER BY created_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/api/contact/:id', authenticate, adminOnly, (req, res) => {
  const { status } = req.body;
  db.run(
    'UPDATE contact_submissions SET status = ? WHERE id = ?',
    [status, req.params.id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: req.params.id, status });
    }
  );
});

app.get('/api/analytics', authenticate, adminOnly, (req, res) => {
  db.all('SELECT COUNT(*) as total_posts FROM blog_posts', (err, posts) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    db.all('SELECT COUNT(*) as published_posts FROM blog_posts WHERE status = "published"', (err2, published) => {
      if (err2) return res.status(500).json({ error: 'Database error' });
      
      db.all('SELECT COUNT(*) as total_services FROM services WHERE is_active = 1', (err3, services) => {
        if (err3) return res.status(500).json({ error: 'Database error' });
        
        db.all('SELECT COUNT(*) as total_testimonials FROM testimonials WHERE is_active = 1', (err4, testimonials) => {
          if (err4) return res.status(500).json({ error: 'Database error' });
          
          db.all('SELECT COUNT(*) as total_calendar_items FROM content_calendar', (err5, calendar) => {
            if (err5) return res.status(500).json({ error: 'Database error' });
            
            db.all('SELECT COUNT(*) as scheduled_items FROM content_calendar WHERE status = "scheduled"', (err6, scheduled) => {
              if (err6) return res.status(500).json({ error: 'Database error' });
              
              db.all('SELECT COUNT(*) as draft_items FROM content_calendar WHERE status = "draft"', (err7, drafts) => {
                if (err7) return res.status(500).json({ error: 'Database error' });
                
                res.json({
                  total_posts: posts[0].total_posts,
                  published_posts: published[0].published_posts,
                  total_services: services[0].total_services,
                  total_testimonials: testimonials[0].total_testimonials,
                  total_calendar_items: calendar[0].total_calendar_items,
                  scheduled_items: scheduled[0].scheduled_items,
                  draft_items: drafts[0].draft_items
                });
              });
            });
          });
        });
      });
    });
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Nova360 Digital Server running on http://localhost:${PORT}`);
  console.log(`Database: ${dbPath}`);
});

module.exports = app;
