(function () {

  var baseTags = ['design', 'tech', 'news', 'culture'];

  var list = [
    {
      name: 'muzli',
      title: 'Muzli Picks',
      description: 'Hand picked, today\'s best design content.',
      channel: 'design',
      url: 'muz.li',
      tags: ['design', 'inspiration', 'graphic', 'ux/ui', 'industrial', 'branding', 'awards'],
      weight: 2,
      static: true,
    },
    {
      name: "community",
      title: "Muzli Community Uploads",
      channel: "design",
      url: "me.muz.li",
      description: "Most awesome content, uploaded by Muzli community",
      tags: ["design", "ux"],
      static: true,
    },
    {
      name: 'store',
      title: 'Muzli Store',
      description: 'Best design deals for Muzli community',
      channel: 'design',
      url: 'store.muz.li',
      tags: ['design', 'inspiration', 'ux/ui', 'game'],
      weight: 2,
    },
    {
      name: 'jobs',
      title: 'Muzli jobs',
      description: 'Top design jobs',
      channel: 'design',
      url: 'muz.li',
      tags: ['design', 'jobs'],
      weight: 2,
    },
    {
      name: 'colors',
      title: 'Muzli color palettes',
      description: 'Hand picked, today\'s best color palettes.',
      channel: 'design',
      url: 'search.muz.li',
      tags: ['design', 'inspiration', 'art', 'graphic'],
      weight: 2,
    },
    {
      name: 'curated',
      title: 'Muzli #shorts',
      description: 'Best graphic and visual inspiration, handpicked today.',
      channel: 'design',
      url: 'muz.li',
      tags: ['design', 'inspiration', 'art', 'graphic'],
      weight: 2,
    },
    {
      name: 'muzli_blog',
      title: 'Muzli blog',
      url: 'medium.muz.li',
      description: 'Our blog. It\'s awesome!',
      tags: ['design', 'inspiration', 'art', 'ux/ui', 'motion'],
      featured: true,
    },
    {
      name: 'dribbble',
      title: 'Dribbble',
      url: 'dribbble.com',
      channel: 'design',
      weight: 2,
      tags: ['design', 'inspiration', 'graphic', 'ui/ui', 'branding'],
      description: 'What are you working on? Dribbble is a community of designers answering that question each day.',
      featured: true,
    },
    {
      name: 'awwwards',
      title: 'Awwwards',
      url: 'awwwards.com',
      channel: 'design',
      weight: 2,
      tags: ['design', 'awards', 'ux/ui'],
      description: 'Awwwards are the Website Awards that recognize and promote the talent and effort of the best developers, designers and web agencies in the world.',
      featured: true,
    },
    {
      name: 'medium',
      title: 'Design articles',
      url: 'medium.com',
      description: 'Our collection of best design articles on Medium',
      tags: ['design', 'ux/ui', 'learning'],
      article: true,
    },
    {
      name: 'producthunt',
      title: 'Product Hunt',
      url: 'producthunt.com',
      channel: 'tech',
      article: true,
      weight: 2,
      tags: ['tech', 'product', 'startups'],
      description: 'Product Hunt is a curation of the best new products, every day. Discover the latest mobile apps, websites, and technology products that everyone\'s talking about.',
      featured: true,
    },
    {
      name: 'techcrunch',
      title: 'Techcrunch',
      url: 'techcrunch.com',
      channel: 'tech',
      article: true,
      tags: ['tech', 'news', 'startups'],
      description: 'A leading technology media property, dedicated to obsessively profiling startups, reviewing new Internet products, and breaking tech news.',
      featured: true,
    },
    {
      name: 'behance',
      title: 'Behance',
      url: 'behance.net',
      channel: 'design',
      weight: 2,
      tags: ['design', 'art', 'inspiration', 'ux/ui', 'graphic'],
      description: 'Showcase and discover the latest work from top online portfolios by creative professionals across industries.'
    },
    {
      name: 'css_winner',
      title: 'CSS Winner',
      url: 'csswinner.com',
      channel: 'design',
      weight: 2,
      tags: ['design', 'awards', 'ux/ui', 'graphic'],
      description: 'CSS Winner is a website design award gallery for web designers and developers to showcase their best works.'
    },
    {
      name: 'abduzeedo',
      title: 'Abduzeedo',
      url: 'abduzeedo.com',
      channel: 'design',
      weight: 2,
      tags: ['design', 'graphic', 'inspiration'],
      description: 'Learn web design, photoshop, illustrator via tutorials and design inspiration.'
    },
    {
      name: 'css_design_awards',
      title: 'CSS Design Awards',
      url: 'cssdesignawards.com',
      tags: ['design', 'inspiration', 'ux/ui', 'css'],
      description: 'Website awards and web design inspiration with the best sites being featured in our CSS Gallery.'
    },
    {
      name: 'land_book',
      title: 'Land Book',
      url: 'land-book.com',
      description: 'The finest hand-picked website inspirations.',
      tags: ['design', 'ux/ui']
    },
    {
      name: 'theinspirationgrid',
      title: 'Inspiration Grid',
      description: 'Daily design inspiration for creatives.',
      channel: 'design',
      url: 'theinspirationgrid.com',
      tags: ['design', 'inspiration', 'graphic', 'art'],
    },
    {
      name: 'maxibestof',
      title: 'MaxiBestOf',
      description: 'MaxiBestOf is a website inspiration feed.',
      channel: 'design',
      url: 'maxibestof.one',
      tags: ['design', 'inspiration', 'ux/ui'],
    },
    {
      name: 'landing-pages',
      title: 'LandingPicks',
      url: 'landingpicks.com',
      description: 'World\'s best Landing Pages, handpicked',
      tags: ['design', 'ux/ui'],
    },
    {
      name: 'the_fwa',
      title: 'The FWA',
      url: 'thefwa.com',
      tags: ['design', 'awards', 'graphic'],
      description: 'Program focused on cutting-edge technology and creativity.',
      featured: true,
    },
    {
      name: 'designspiration',
      title: 'Designspiration',
      url: 'designspiration.net',
      tags: ['design', 'inspiration', 'graphic'],
      description: 'A tool for discovering great art, design, architecture, photography and web inspiration.'
    },
    {
      name: 'siteinspire',
      title: 'Siteinspire',
      url: 'siteinspire.com',
      tags: ['design', 'ux/ui', 'inspiration', 'css'],
      description: 'A CSS gallery and showcase of the best web design inspiration.'
    },
    {
      name: "smashing_mag",
      title: "Smashing Mag",
      url: "smashingmagazine.com",
      tags: ['tech', 'design', 'code', 'learning'],
      article: true,
      description: 'Magazine for web designers and developers.',
      featured: true,
    },
    {
      name: 'ted',
      title: 'TED',
      url: 'www.ted.com/talks',
      article: true,
      tags: ['culture', 'inspiration', 'science', 'art'],
      description: 'An invitation-only event where the world\'s leading thinkers and doers gather to find inspiration.'
    },
    {
      name: 'vlogs',
      title: 'Videos',
      tags: ['design', 'inspiration', 'entrepreneurship', 'graphic', 'ux/ui', 'learning'],
      description: 'A collection of daily videos about design, inspiration, entrepreneurship, personal growth, technology and more.',
      featured: true,
    },
    {
      name: 'fubiz',
      title: 'Fubiz',
      url: 'fubiz.net',
      weight: 2,
      tags: ['design', 'inspiration', 'art', 'marketing'],
      description: 'The latest creative news from Fubiz about art, design and pop-culture.',
      featured: true,
    },
    {
      name: 'bored_panda',
      title: 'Bored Panda',
      url: 'boredpanda.com',
      nsfw: true,
      tags: ['culture', 'fun', 'art'],
      description: 'Art, design and photography community for creative people.'
    },
    {
      name: 'the_next_web',
      title: 'The Next Web',
      url: 'thenextweb.com',
      channel: 'tech',
      article: true,
      tags: ['tech', 'startips'],
      description: 'One of the world\'s largest online publications that delivers an international perspective on the latest news about Internet technology, business and more.',
      featured: true,
    },
    {
      name: 'mashable',
      title: 'Mashable',
      url: 'mashable.com',
      channel: 'tech',
      article: true,
      tags: ['culture', 'social-media', 'marketing'],
      description: 'A global, multi-platform media and entertainment company.'
    },
    {
      name: 'wired_design',
      title: 'Wired',
      url: 'wired.com/category/design',
      channel: 'tech',
      article: true,
      tags: ['tech', 'science', 'gaming', 'startups'],
      description: 'In-depth coverage of current and future trends in technology, and how they are shaping business, entertainment, communications, science, politics, and more.'
    },
    {
      name: 'the_verge',
      title: 'The Verge',
      url: 'theverge.com',
      channel: 'tech',
      article: true,
      tags: ['tech', 'culture', 'news', 'startups'],
      description: 'Covers the intersection of technology, science, art, and culture.'
    },
    {
      name: 'hacker_news',
      title: 'Hacker News',
      url: 'news.ycombinator.com',
      article: true,
      tags: ['tech', 'code', 'startups', 'geek'],
      description: 'A social news website focusing on computer science and entrepreneurship.',
      featured: true,
    },
    {
      name: 'codrops',
      title: 'Codrops',
      url: 'tympanus.net/codrops/',
      tags: ['design', 'ux/ui', 'code', 'web'],
      description: 'A web design and development blog that publishes articles and tutorials about the latest web trends, techniques and new possibilities.',
      featured: true,
    },
    {
      name: 'cnn',
      title: 'CNN',
      url: 'edition.cnn.com',
      article: true,
      tags: ['news'],
      description: 'Latest news and breaking news today for U.S., world, weather, entertainment, politics and health.'
    },
    {
      name: 'vox',
      title: 'Vox',
      url: 'vox.com',
      article: true,
      tags: ['culture', 'news', 'politics'],
      description: 'Explain the news. Politics, public policy, world affairs, pop culture, science, business and more.'
    },
    {
      name: '99designs',
      title: '99designs',
      url: '99designs.com/blog/',
      description: 'The Creative Edge is the best place to get inspired and learn about design.',
      tags: ['design', 'inspiration', 'branding', 'marketing', 'graphic'],
    },
    {
      name: 'lapaninja',
      title: 'Lapa Ninja',
      url: 'lapa.ninja',
      description: 'The best landing page design inspiration from around the web.',
      tags: ['design', 'inspiration', 'landing', 'branding', 'ux/ui'],
    },
    {
      name: 'pixels',
      title: 'Pixelfika',
      url: 'klart.io/pixels',
      description: 'Be inspired by handpicked designs and copywriting.',
      tags: ['design', 'inspiration', 'ux/ui'],
    },
    {
      name: 'forbes',
      title: 'Forbes',
      url: 'forbes.com',
      article: true,
      tags: ['news', 'business', 'entrepreneurship', 'startups'],
      description: 'Includes business, technology, stock markets, personal finance, and lifestyle.'
    },
    {
      name: 'design_milk',
      title: 'Design Milk',
      url: 'design-milk.com',
      channel: 'design',
      tags: ['design', 'home', 'art'],
      description: 'A design blog featuring interior design ideas, architecture, modern furniture, home decor, art, style, and technology.'
    },
    {
      name: 'tuts_plus',
      title: 'Tuts+',
      url: 'webdesign.tutsplus.com',
      channel: 'design',
      tags: ['tech', 'ux/ui'],
      description: 'Updated daily, discover over 20750 How-to tutorials. Find videos and online courses to help you learn skills like code, photography, web design and more.'
    },
    {
      name: 'gizmodo',
      title: 'Gizmodo',
      url: 'gizmodo.com',
      channel: 'tech',
      article: true,
      tags: ['tech', 'gadgets'],
      description: 'Design and technology blog.'
    },
    {
      name: 'engadget',
      title: 'Engadget',
      url: 'engadget.com',
      channel: 'tech',
      article: true,
      tags: ['tech', 'gadgets'],
      description: 'A web magazine with obsessive daily coverage of everything new in gadgets and consumer electronics.'
    },
    {
      name: 'httpster',
      title: 'HTTPSTER',
      url: 'httpster.net',
      weight: 2,
      tags: ['design', 'inspiration', 'ux/ui'],
      description: 'A curated showcase of s**t-hot web design with a less-is-more bent.'
    },
    {
      name: 'the_onion',
      title: 'The onion',
      url: 'theonion.com',
      tags: ['humor', 'news', 'culture', 'entertainment'],
      article: true,
      description: 'A farcical newspaper featuring world, national and community news.'
    },
    {
      name: 'designboom',
      title: 'Designboom',
      url: 'designboom.com',
      tags: ['design', 'inspiration', 'architecture', 'home', 'industrial', 'branding'],
      description: 'A popular digital magazine for architecture & design culture. daily news for a professional and creative audience.'
    },
    {
      name: 'buzzfeed',
      title: 'Buzzfeed',
      url: 'buzzfeed.com',
      article: true,
      tags: ['culture', 'entertainment'],
      nsfw: true,
      description: 'Social news and entertainment.'
    },
    {
      name: 'art_station',
      title: 'Art Station',
      url: 'artstation.com',
      nsfw: true,
      tags: ['design', 'art', 'game'],
      description: 'A leading showcase platform for games, film, media & entertainment artists.'
    },
    {
      name: 'colossal',
      title: 'Colossal',
      url: 'thisiscolossal.com',
      tags: ['design', 'culture', 'art', 'inspiration', 'photo'],
      description: 'A blog that explores art and other aspects of visual culture. '
    },
    {
      name: 'webdesigner_depot',
      title: 'Webdesigner Depot',
      url: 'webdesignerdepot.com',
      tags: ['design', 'ux/ui', 'inspiration'],
      description: 'Web Design Resources for Web Designers.'
    },
    {
      name: 'fast_co_design',
      title: 'Fast Co. Design',
      url: 'fastcodesign.com',
      tags: ['design', 'branding', 'marketing'],
      description: 'Inspiring stories about innovation and business, seen through the lens of design.'
    },
    {
      name: 'ars_technica',
      title: 'Ars Technica',
      url: 'arstechnica.com',
      article: true,
      tags: ['tech', 'startups'],
      description: 'The PC enthusiast\'s resource. Power users and the tools they love, without computing religion.'
    },
    {
      name: 'dezeen',
      title: 'Dezeen',
      url: 'dezeen.com',
      tags: ['design', 'architecture', 'art', 'home', 'culture'],
      description: 'Architecture, interiors and design magazine.'
    },
    {
      name: 'alistapart',
      title: 'A List Apart',
      url: 'alistapart.com',
      article: true,
      tags: ['tech', 'ux/ui', 'code'],
      description: 'Explores the design, development, and meaning of web content, with a special focus on web standards and best practices.'
    },
    {
      name: 'swiss_miss',
      title: 'Swiss Miss',
      url: 'swiss-miss.com',
      tags: ['design', 'culture', 'art', 'inspiration', 'art', 'branding'],
      description: 'A design blog run by Tina Roth Eisenberg'
    },
    {
      name: 're_code',
      title: 'Re-code',
      url: 'www.recode.net',
      article: true,
      tags: ['tech', 'culture'],
      description: 'Get the latest independent tech news, reviews and analysis from Recode with the most informed and respected journalists in technology and media.'
    },
    {
      name: 'one_page_love',
      title: 'One Page Love',
      url: 'onepagelove.com',
      tags: ['design', 'ux/ui', 'inspiration'],
      description: 'A One Page website design gallery showcasing the best Single Page website designs from around the web.'
    },
    {
      name: '99u',
      title: '99u',
      url: '99u.com',
      article: true,
      tags: ['culture', 'inspiration', 'productivity'],
      description: 'Provides actionable insights on productivity, organization, and leadership to help creatives people push ideas forward.'
    },
    {
      name: 'ads_of_the_world',
      title: 'Ads of the World',
      url: 'adsoftheworld.com',
      tags: ['culture', 'marketing', 'advertising', 'branding'],
      article: true,
      description: 'Advertising archive, featuring creative work from across the industry.'
    },
    {
      name: 'houzz',
      title: 'Houzz',
      url: 'houzz.com',
      tags: ['design', 'home'],
      description: 'The new way to design your home. 11 million interior design photos, home decor & decorating ideas.'
    },
    {
      name: 'booooooom',
      title: 'Booooooom',
      url: 'booooooom.com',
      tags: ['art', 'design', 'inspiration', 'photo'],
      description: 'A blog about art, design and general creative inspiration.'
    },
    {
      name: 'brand_new',
      title: 'Brand New',
      url: 'underconsideration.com/brandnew/',
      tags: ['culture', 'branding', 'marketing', 'design', 'graphic'],
      description: 'Opinions on corporate and brand identity work.'
    },
    {
      name: 'core77',
      title: 'Core77',
      url: 'core77.com',
      tags: ['tech', 'culture', 'marketing', 'gadgets', 'industrial'],
      description: 'Magazine and resource offering calendar of events, firm listings, jobs section, forums, articles and competitions.'
    },
    {
      name: 'creative_review',
      title: 'Creative Review',
      url: 'creativereview.co.uk',
      tags: ['design', 'art', 'advertising'],
      description: 'Monthly publication covering the communication arts worldwide.'
    },
    {
      name: 'pocket_lint',
      title: 'Pocket Lint',
      url: 'pocket-lint.com',
      article: true,
      tags: ['tech', 'gadgets', 'mobile'],
      description: 'Electronic product reviews, including news on gadgets, digital cameras, home cinema, audio, car and mobile phone.'
    },
    {
      name: 'css_author',
      title: 'CSS Author',
      url: 'cssauthor.com',
      tags: ['tech', 'ux/ui', 'css'],
      description: 'Web/Mobile design & development blog, providing user interface design freebies, resources, articles, tools and more.'
    },
    {
      name: 'daily_dot',
      title: 'Daily Dot',
      url: 'dailydot.com',
      tags: ['culture', 'entertainment'],
      article: true,
      description: 'Latest news, opinion, and in-depth reporting from around the Internet.'
    },
    {
      name: 'design_you_trust',
      title: 'Design You Trust',
      url: 'designyoutrust.com',
      tags: ['design', 'art', 'inspiration'],
      description: 'A hourly updated collective design blog full of design portfolios, photos, creative advertisements, architectural inspirations and videos.'
    },
    {
      name: 'design_your_way',
      title: 'Design Your Way',
      url: 'designyourway.net',
      tags: ['design', 'ux/ui'],
      description: 'A design magazine that is showcasing resources for web and graphic designers.'
    },
    {
      name: 'home_designing',
      title: 'Home Designing',
      url: 'home-designing.com',
      tags: ['design', 'interior-design', 'architecture', 'home'],
      description: 'Inspirational Interior Design Ideas for Living Room Design, Bedroom Design, Kitchen Design and the entire home.'
    },
    {
      name: 'hongkiat',
      title: "Hongkiat",
      url: "hongkiat.com",
      tags: ['ux/ui', 'tech'],
      article: true,
      description: 'Design weblog for designers, bloggers and tech users. Covering useful tools, tutorials, tips and inspirational artworks.'
    },
    {
      name: 'its_nice_that',
      title: 'Its Nice That',
      url: 'itsnicethat.com',
      tags: ['design', 'inspiration', 'art'],
      description: 'Ideas, originality, imagination and creativity in any context.'
    },
    {
      name: 'just_creative',
      title: 'Just Creative',
      url: 'justcreative.com',
      tags: ['design', 'ux/ui', 'graphic'],
      description: 'Graphic design portfolio & blog of Jacob Cass, a freelance designer in New York specializing in logo, web & brand identity.'
    },
    {
      name: 'kottke',
      title: 'Kottke',
      url: 'kottke.org',
      tags: ['thinkers', 'culture'],
      description: 'Get into the world of Jason Kottke, a freelance web designer and learn about design, food, weblogs, and living in New York City.'
    },
    {
      name: 'lifehacker',
      title: 'Lifehacker',
      url: 'lifehacker.com',
      article: true,
      tags: ['news', 'lifehacks', 'productivity'],
      description: 'Daily blog on software and personal productivity recommends downloads, web sites and shortcuts that help you work smarter.'
    },
    {
      name: 'line25',
      title: 'Line25',
      url: 'line25.com',
      tags: ['culture', 'ux/ui', 'web'],
      description: 'Ideas and inspiration to web creatives, including roundups of cool website designs and tutorials to help you learn new skills.'
    },
    {
      name: 'noupe',
      title: 'Noupe',
      url: 'noupe.com',
      tags: ['culture', 'ux/ui', 'web'],
      description: 'Delivers stylish and dynamic news for designers and Web developers across the globe on all subjects of design.'
    },
    {
      name: 'kurzgesagt',
      title: 'Kurzgesagt – In a Nutshell',
      url: 'youtube.com/user/Kurzgesagt',
      description: 'Videos explaining things with optimistic nihilism.',
      tags: ['geek', 'culture'],
    },
    {
      name: 'onextrapixel',
      title: 'Onextrapixel',
      url: 'onextrapixel.com',
      tags: ['design', 'ux/ui', 'web'],
      description: 'A digital community devoted in sharing web design and development freebies, great tutorials, useful Internet resources, online tips and tricks for web designers.'
    },
    {
      name: 'print_mag',
      title: 'Print Mag',
      url: 'printmag.com',
      tags: ['design', 'graphic', 'art'],
      description: 'Design and visual culture brand encompassing a venerated magazine'
    },
    {
      name: 'psfk',
      title: 'psfk',
      url: 'psfk.com',
      article: true,
      tags: ['news', 'marketing', 'business'],
      description: ' Insights Portal with a database of over 75000 innovation reports on advertising design, retail, tech & more.'
    },
    {
      name: 'readwrite',
      title: 'ReadWrite',
      url: 'readwrite.com',
      article: true,
      tags: ['culture'],
      description: 'Covers web technology, news, reviews, analysis on web apps, trends, and social networking.'
    },
    {
      name: 'speckyboy',
      title: 'Speckyboy',
      url: 'speckyboy.com',
      tags: ['design', 'ux/ui', 'web'],
      description: 'Blog for designers with its focus on sharing helpful resources, exploring new techniques, sharing useful tips'
    },
    {
      name: 'spoon_graphics',
      title: 'Spoon Graphics',
      url: 'blog.spoongraphics.co.uk',
      tags: ['design', 'ux/ui', 'graphic'],
      description: 'Design Tutorials, Graphic Design Articles and Free Resource Downloads from the blog of Graphic Designer Chris Spooner.'
    },
    {
      name: 'design_taxi',
      title: 'Design Taxi',
      url: 'designtaxi.com',
      tags: ['design', 'art', 'inspiration'],
      description: 'Talk about Design, Art, Photography, Advertising, Architecture, Style, Culture, Technology, and Social Media.'
    },
    {
      name: 'the_dieline',
      title: 'The Dieline',
      url: 'thedieline.com',
      tags: ['news', 'packaging', 'graphic'],
      description: 'Daily package design & branding inspiration, resources, news, conferences, events, and awards.'
    },
    {
      name: 'yanko_design',
      title: 'Yanko Design',
      url: 'yankodesign.com',
      tags: ['design', 'art'],
      description: 'A magazine dedicated to covering the best in international product design.'
    },
    {
      name: 'creative_bloq',
      title: 'Creative Bloq',
      url: 'creativebloq.com',
      tags: ['design', 'graphic', 'ux/ui'],
      description: 'Daily inspiration for creative people. Fresh thinking, expert tips and tutorials to supercharge your creative muscles.'
    },
    {
      name: 'ux_mag',
      title: 'UX Mag',
      url: 'uxmag.com',
      tags: ['design', 'ux/ui'],
      description: 'A resource for everything related to user experience.'
    },
    {
      name: 'abc_news',
      title: 'ABC News',
      url: 'abcnews.go.com',
      article: true,
      tags: ['news'],
      description: 'National and world news, broadcast video coverage, and exclusive interviews.'
    },
    {
      name: 'business_insider',
      title: 'Business Insider',
      url: 'businessinsider.com',
      article: true,
      tags: ['business', 'finance', 'news'],
      description: 'Business with deep financial, media, tech, and other industry verticals.'
    },
    {
      name: 'cnet',
      title: 'CNET',
      url: 'cnet.com',
      article: true,
      tags: ['tech'],
      description: 'Tech product reviews, news, prices, videos, forums, how-tos and more.'
    },
    {
      name: 'entrepreneur',
      title: 'Entrepreneur',
      url: 'entrepreneur.com',
      article: true,
      tags: ['news', 'business', 'entrepreneurship'],
      description: 'Advice, insight, profiles and guides for established and aspiring entrepreneurs worldwide.'
    },
    {
      name: 'io9',
      title: 'io9',
      url: 'io9.gizmodo.com',
      article: true,
      tags: ['tech', 'science'],
      description: 'Science fiction, fantasy, futurism, science, technology and related areas.'
    },
    {
      name: 'mac_rumors',
      title: 'Mac Rumors',
      url: 'macrumors.com',
      article: true,
      tags: ['tech', 'apple', 'mac'],
      description: 'Apple news and rumors with user contribution and commentary.'
    },
    {
      name: 'social_media_examiner',
      title: 'Social Media Examiner',
      url: 'socialmediaexaminer.com',
      article: true,
      tags: ['tech', 'social-media', 'marketing', 'seo'],
      description: 'Master social media marketing to find leads, increase sales and improve branding.'
    },
    {
      name: 'time',
      title: 'Time',
      url: 'time.com/',
      article: true,
      tags: ['culture'],
      description: 'Politics, world news, photos, video, tech reviews, health, science and entertainment news.'
    },
    {
      name: 'vb',
      title: 'VentureBeat',
      url: 'venturebeat.com',
      article: true,
      tags: ['news', 'business', 'entrepreneurship'],
      description: 'News & perspective on tech innovation.'
    },
    {
      name: 'kotaku',
      title: 'Kotaku',
      url: 'kotaku.com',
      article: true,
      tags: ['culture', 'gaming'],
      description: 'A video game-focused blog'
    },
    {
      name: 'subtraction',
      title: 'Subtraction',
      url: 'subtraction.com',
      article: true,
      tags: ['culture', 'ux/ui'],
      description: 'Life and thoughts of Khoi Vin, a graphic designer in New York City.'
    },
    {
      name: 'motionographer',
      title: 'Motionographer',
      url: 'motionographer.com',
      tags: ['culture', 'motion', 'animation'],
      description: 'inspiring work and important news for the motion design, animation and visual effects communities.'
    },
    {
      name: 'contemporist',
      title: 'Contemporist',
      url: 'contemporist.com',
      tags: ['culture', 'interior-design', 'architecture', 'home'],
      description: 'A community that celebrates contemporary culture.'
    },
    {
      name: 'curbed',
      title: 'Curbed',
      url: 'curbed.com',
      tags: ['design', 'interior-design', 'architecture', 'home'],
      description: 'All things home, from interior design and architecture to home tech, renovations, tiny houses, prefab, and real estate.'
    },
    {
      name: 'uncrate',
      title: 'Uncrate',
      url: 'uncrate.com',
      tags: ['news', 'fashion', 'gadgets'],
      description: 'Digital magazine for guys who love to buy stuff. Includes cars, tools, and books.'
    },
    {
      name: 'adweek',
      title: 'Adweek',
      url: 'adweek.com',
      article: true,
      tags: ['news', 'advertising', 'marketing'],
      description: 'Covers media news, including print, technology, advertising, branding and television.'
    },
    {
      name: 'no_film_school',
      title: 'No Film School',
      url: 'nofilmschool.com',
      tags: ['news', 'film', 'cinema', 'video'],
      description: 'No Film School is where filmmakers learn from each other — “no film school” required.'
    },
    {
      name: 'my_modern_met',
      title: 'My Modern Met',
      url: 'mymodernmet.com',
      tags: ['culture', 'art', 'photography'],
      description: 'Celebrates creative ideas. Join our community and discover amazing artists every day!'
    },
    {
      name: 'apartment_therapy',
      title: 'Apartment Therapy',
      url: 'apartmenttherapy.com',
      tags: ['design', 'interior-design', 'diy', 'home'],
      description: 'Lifestyle and interior design community sharing design lessons, DIY how-tos, shopping guides and expert advice for creating a happy, beautiful home.'
    },
    {
      name: 'cool_hunting',
      title: 'Cool Hunting',
      url: 'www.coolhunting.com',
      tags: ['fashion', 'culture'],
      description: 'Covers the latest in design, technology, style, travel, art and culture.'
    },
    {
      name: 'fastcompany',
      title: 'Fastcompany',
      url: 'www.fastcompany.com',
      article: true,
      tags: ['news', 'business'],
      description: 'Innovative and creative thought leaders who are actively inventing the future of business.'
    },
    {
      name: 'fox_news',
      title: 'Fox News',
      url: 'www.foxnews.com',
      article: true,
      tags: ['news'],
      description: 'Breaking, latest and current news.'
    },
    {
      name: 'bbc',
      title: 'BBC',
      url: 'www.bbc.com',
      article: true,
      tags: ['news'],
      description: 'Breaking news, sport, TV, radio and a whole lot more.'
    },
    {
      name: 'nytimes',
      title: 'New York Times',
      url: 'www.nytimes.com',
      article: true,
      tags: ['news'],
      description: 'Breaking news, multimedia, reviews & opinion on Washington, business, sports, movies, travel, books and more.'
    },
    {
      name: 'vice',
      title: 'Vice',
      url: 'www.vice.com/en_us',
      nsfw: true,
      tags: ['news'],
      description: 'Ever-expanding nebula of immersive investigative journalism, uncomfortable sociological examination, uncouth activities and more.'
    },
    {
      name: 'futurism',
      title: 'Futurism',
      url: 'futurism.com',
      article: true,
      tags: ['news', 'science', 'futurism'],
      description: 'News, infographics, and videos on the science and technology that are shaping the future of humanity, including AI, robotics and virtual reality.'
    },
    {
      name: 'npr',
      title: 'NPR',
      url: 'www.npr.org',
      article: true,
      tags: ['news'],
      description: 'Breaking national and world news. '
    },
    {
      name: '500px',
      title: '500px',
      url: '500px.com',
      tags: ['culture', 'photography'],
      nsfw: true,
      description: 'Find the perfect royalty-free photos on 500px Marketplace.'
    },
    {
      name: 'unsplash',
      title: 'Unsplash',
      url: 'unsplash.com',
      tags: ['culture', 'photography'],
      description: 'Beautiful, free images and photos that you can download and use for any project. Better than any royalty free or stock photos.',
      new: true,
    },
    {
      name: 'codepen',
      title: 'Codepen',
      url: 'codepen.io',
      tags: ['tech', 'code'],
      description: 'Show case of advanced techniques with editable source code.'
    },
    {
      name: 'uimovement',
      title: 'Screenlane (UI Movement)',
      url: 'screenlane.com',
      description: 'Get inspired and keep up with the latest web & mobile app UI design trends',
      tags: ['design', 'interface'],
    },
    {
      name: 'betalist',
      title: 'Beta List',
      url: 'betalist.com',
      description: 'An overview of upcoming internet startups. Discover and get early access to the future.',
      tags: ['news', 'startups', 'business']
    },
    {
      name: 'designmodo',
      title: 'Designmodo',
      url: 'designmodo.com',
      description: 'Design and Web Development blog.',
      tags: ['design', 'webdesign']
    },
    {
      name: 'designshack',
      title: 'Design Shack',
      url: 'designshack.net',
      description: 'Showcases inspiring web design, alongside resources and tutorials to teach new techniques.',
      tags: ['design', 'code', 'business', 'inspiration']
    },
    {
      name: 'vandelay_design',
      title: 'Vandelay Design',
      url: 'www.vandelaydesign.com',
      description: 'Write & create products that help educate and inspire.',
      tags: ['design', 'code', 'business', 'inspiration']
    },
    {
      name: 'sketch_app_sources',
      title: 'Sketch App Sources',
      url: 'www.sketchappsources.com',
      description: 'Free and premium Sketch resources for mobile, web, UI, and UX designers working with Sketch',
      tags: ['design']
    },
    {
      name: 'cody_house',
      title: 'Cody House',
      url: 'codyhouse.co',
      description: 'A free library of HTML/CSS/Javascript resources to boost your web projects and learn new tricks.',
      tags: ['tech', 'code']
    },
    {
      name: 'graphicburger',
      title: 'Graphicburger',
      url: 'graphicburger.com',
      description: 'Tasty design resources made with care for each pixel. Free for both personal & commercial use. Have a bite!',
      tags: ['design']
    },
    {
      name: 'typewolf',
      title: 'Typewolf',
      url: 'www.typewolf.com',
      description: 'Helps designers choose the perfect font combination for their next design project',
      tags: ['design', 'typography', 'inspiration']
    },
    {
      name: 'fontsinuse',
      title: 'Fonts In Use',
      url: 'fontsinuse.com',
      description: 'A searchable archive of typographic design, indexed by typeface, format, and topic.',
      tags: ['design', 'typography'],
    },
    {
      name: 'csstricks',
      title: 'CSS-Tricks',
      url: 'css-tricks.com',
      description: 'CSS-Tricks is a website about websites.',
      tags: ['tech', 'code'],
    },
    {
      name: 'demilked',
      title: 'Demilked',
      url: 'www.demilked.com',
      description: 'Milk the world\'s most creative minds and make you tasty inspiration cocktails',
      tags: ['design', 'art', 'business', 'inspiration']
    },
    {
      name: 'creativeboom',
      title: 'Creative Boom',
      url: 'www.creativeboom.com',
      description: 'Art & design blog for the creative industries, featuring art, graphic design, illustration and photography.',
      tags: ['design', 'inspiration', 'art']
    },
    {
      name: 'tw_rl',
      title: 'tw-rl',
      description: 'Saves and organized tweets, design threads and links from around the web.',
      channel: 'design',
      url: 'tw-rl.com',
      tags: ['design'],
    },
    {
      name: 'satorigraphics',
      title: 'Satori Graphics',
      description: 'Welcome to Satori Graphics, the home of graphic design content right here on Youtube.',
      channel: 'design',
      url: 'youtube.com/c/SatoriGraphics',
      tags: ['design'],
    },
    {
      name: 'builtformars',
      title: 'Built For Mars',
      description: 'On a mission to help the world build better user experiences by demystifying UX.',
      channel: 'design',
      url: 'builtformars.com',
      tags: ['design'],
    },
    {
      name: 'interaction_design',
      title: 'Interaction Design Foundation',
      description: 'A goldmine of information on interaction design.',
      channel: 'design',
      url: 'interaction-design.org',
      tags: ['design'],
    },
    {
      name: 'eyeondesign',
      title: 'Eye on Design',
      description: 'World’s most exciting designers—and the issues they care about.',
      channel: 'design',
      url: 'eyeondesign.aiga.org',
      tags: ['design'],
    },
    {
      name: 'digitaltrends',
      title: 'Digital Trends',
      description: 'The latest coverage on all things tech with in-depth product reviews, videos, news, and the best deals happening now.',
      channel: 'design',
      url: 'digitaltrends.com',
      tags: ['tech'],
    },
    {
      name: 'loversmagazine',
      title: 'Lovers Magazine',
      description: 'Lovers Magazine is an online magazine for creative professionals.',
      channel: 'design',
      url: 'loversmagazine.com',
      tags: ['design'],
    },
    {
      name: 'dwell',
      title: 'Dwell',
      url: 'dwell.com',
      description: 'Modern living, home design ideas, inspiration, and advice.',
      tags: ['design', 'inspiration'],
      new: true,
    },
    {
      name: 'popsci',
      title: 'Popular Science',
      url: 'popsci.com',
      description: 'Awe-inspiring science reporting, technology news, and DIY projects. Skunks to space robots, primates to climates.',
      tags: ['tech', 'geek'],
      new: true,
    },
    {
      name: 'midjourney',
      title: 'Midjourney',
      url: 'www.midjourney.com/showcase/recent/',
      description: 'Explore the Midjourney community\'s favourite images.',
      tags: ['design', 'ai'],
      new: true,
    },
    {
      name: 'designer_daily',
      title: 'Designer Daily',
      url: 'www.designer-daily.com',
      description: 'Graphic and web design blog',
      tags: ['design', 'graphic'],
      new: true,
    },
    {
      name: 'graphicdesignjunction',
      title: 'Graphic Design Junction',
      url: 'graphicdesignjunction.com',
      description: 'Free fonts, resume templates, business cards, logo design, mockups, procreate, photoshop tutorials',
      tags: ['design', 'templates', 'assets'],
      new: true,
    },
    {
      name: 'cssnectar',
      title: 'CSS Nectar',
      url: 'cssnectar.com',
      description: 'CSS Gallery for Web Design Inspiration',
      tags: ['design', 'css'],
      new: true,
    },
    {
      name: 'commercecream',
      title: 'Commerce Cream',
      url: 'commercecream.com',
      description: 'Showcase of beautiful ecommerce experiences that are powered by Shopify. ',
      tags: ['design', 'ui', 'ecommerce'],
    },
    {
      name: 'flames_design',
      title: 'Flames',
      url: 'flames.design',
      description: 'Discover top designers worldwide on Flames.',
      tags: ['design', 'inspiration', 'ui'],
    },
    {
      name: 'layers_to',
      title: 'Layers',
      url: 'layers.to',
      description: 'Layers is a place where designers can share, connect and grow.',
      tags: ['design', 'designers'],
    },
    {
      name: 'ux_design_awards',
      title: 'UX Design Awards',
      url: 'ux-design-awards.com',
      description: 'The Global Competition for Excellent Experiences',
      tags: ['design', 'ux', 'ui'],
    },
    {
      name: 'the_brandidentity',
      title: 'The Brand Identity',
      url: 'the-brandidentity.com',
      description: 'Resource for Graphic Design',
      tags: ['design', 'ux', 'ui'],
    },
    {
      name: 'deviantart',
      title: 'DeviantArt',
      url: 'deviantart.com',
      description: 'The Largest Online Art Gallery and Community',
      tags: ['design', 'art', 'graphic'],
    },
    {
      name: 'emaillove',
      title: 'Email Love',
      url: 'emaillove.com',
      description: 'Curated Email Inspiration & Resources',
      tags: ['design', 'ui', 'ecommerce'],
    },
    {
      name: 'invisionapp',
      title: 'InVision Blog',
      url: 'blog.invisionapp.com',
      description: 'Thoughts on users, experience, and design.',
      tags: ['design', 'prototyping'],
      featured: true,
    },
    {
      name: 'uplabs',
      title: 'Uplabs',
      url: 'uplabs.com',
      description: 'Uplabs curates the best of design & development inspiration, resources and freebies. Every day!',
      tags: ['design', 'inspiration'],
    },
    {
      name: 'sidebar',
      title: 'Sidebar',
      url: 'sidebar.io',
      article: true,
      tags: ['design', 'webdesign', 'web'],
      description: 'A list of the 5 best design links of the day.',
    },
    {
      name: 'designer_news',
      title: 'Designer News',
      url: 'designernews.co',
      article: true,
      weight: 2,
      tags: ['design', 'ux/ui', 'tech'],
      description: 'Designer News is a community where design and technology professionals share interesting links and timely events.'
    },

  ].map(source => {

    if (!source.icon) {
      source.icon = `images/icon_${source.name}.png`;
    }

    return source;
  });

  const timestamp = new Date().toLocaleDateString("en-US")?.replaceAll('/', '');

  fetch('https://files.muzli.cloud/cloud-sources.json?t=' + timestamp, {
    cache: "no-cache"
  })
    .then(res => res.json())
    .then(cloudSources => {
      if (cloudSources && cloudSources.length) {
        list.push(...cloudSources.filter(cloudSource => {

          if (!cloudSource.name || !cloudSource.title || !cloudSource.icon) {
            return false;
          }

          // Filter already existing sources
          return !list.find(source => source.name === cloudSource.name);
        }))
      } 
    })
    .catch((err) => {
      console.warn('Failed to load external sources.')
    })

  // Common.js package manager support (e.g. ComponentJS, WebPack)
  if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports) {
    module.exports = list;
  }

  else {
    angular.module('sources')
      .constant('sources_list', list)
      .constant('other_tags_list', list.reduce(function (arr, source) {
        return arr.concat(source.tags.reduce(function (arr, tag) {
          if (baseTags.indexOf(tag) === -1) {
            arr.push(tag);
          }
          return arr;
        }, []));
      }, []));
  }
})();
