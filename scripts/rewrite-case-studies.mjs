import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = process.cwd();
const PROJECT_HTML_DIR = path.join(ROOT, 'src', 'content-html', 'projects');
const PROJECT_DATA_DIR = path.join(ROOT, 'src', 'content', 'projects');

const caseStudies = {
  'accolade.html': {
    headline: 'Personalized healthcare at enterprise scale',
    copy: 'Accolade needed to make employee healthcare feel less fragmented and more human. The work sharpened a clear category promise, Personalized Healthcare, then translated it into a system leaders could understand, teams could sell, and employees could trust. The result positions Accolade as a strategic answer to one of the most expensive gaps in benefits.',
  },
  'accrue.html': {
    headline: 'Pricing intelligence leaders can act on',
    copy: 'Accrue turns pricing from a spreadsheet argument into a growth lever. The brand clarifies the cost of guesswork, then gives finance, product, and revenue leaders a more confident way to make pricing decisions. Every element is built to make evidence feel faster, clearer, and more commercially useful.',
  },
  'airbnb.html': {
    headline: 'Making hosting feel effortless and valuable',
    copy: "Airbnb's host experience depends on trust, clarity, and emotional momentum. The design and animation direction helped product launches feel warmer, easier to understand, and more ownable to the Airbnb brand. The work gave hosts a more engaging path through new features while reinforcing the connection between people, places, and income.",
  },
  'airbo.html': {
    headline: 'Benefits education people actually want to use',
    copy: 'Airbo had a practical business problem: benefits communication is usually ignored. The redesign reframed education as quick, useful, and surprisingly enjoyable, giving benefits leaders a tool employees would actually open. The identity balances HR credibility with consumer-grade ease, so both buyers and users can see the value immediately.',
  },
  'apple.html': {
    headline: 'Material innovation made instantly legible',
    copy: 'Apple needed a simple visual story for a new generation of glass across the product suite. The work made durability feel precise, desirable, and unmistakably Apple, turning a technical material advancement into a premium product signal customers could understand at a glance.',
  },
  'arcee-ai.html': {
    headline: "An AI workflow brand with a conductor's point of view",
    copy: 'Arcee AI helps teams route work across specialized small language models, but the strategic challenge was making orchestration feel simple. The brand puts the user in the role of conductor: in control, informed, and able to direct complex AI systems with confidence. It gives a technical platform a clear executive story.',
  },
  'beautiful.html': {
    headline: 'Presentation software built for executive impact',
    copy: 'Beautiful.AI needed to communicate speed without making the product feel lightweight. The work frames presentations as moments of decision, giving teams a faster path from raw thinking to polished executive communication. The brand system turns efficiency into confidence, clarity, and momentum in the room.',
  },
  'beckley-retreats.html': {
    headline: 'A digital platform for clinically serious retreats',
    copy: "Beckley Retreats required a platform that could support a sensitive, high-consideration customer journey. The work helped translate the organization's scientific credibility and retreat experience into a digital system that feels calm, trustworthy, and operationally clear for a new category of psilocybin care.",
  },
  'bitrise.html': {
    headline: 'CI/CD made faster, clearer, and easier to trust',
    copy: 'Bitrise lives in a crowded developer infrastructure market where speed alone is not enough. The brand direction turns automation into a system story: every part of the workflow fitting together, reducing friction, and helping engineering leaders ship with more confidence. It makes operational efficiency visible.',
  },
  'bizzabo.html': {
    headline: 'The operating system for modern event experiences',
    copy: 'Bizzabo needed to own the intersection of physical and digital events. The work frames the platform as the infrastructure behind more personalized, connected, and measurable experiences. For CMOs, the story is clear: events are not logistics, they are a strategic channel for relationships, data, and brand momentum.',
  },
  'brain-drain.html': {
    headline: 'A working archive of digital experiments',
    copy: "Brain Drain collects the sketches, tests, and strange digital artifacts that sharpen the studio's point of view. It shows the range behind the client work: motion, interaction, visual systems, and the kind of experimentation that helps brands find a more memorable edge.",
  },
  'chase-travel.html': {
    headline: 'Travel momentum for a premium card audience',
    copy: "Chase Travel needed to make planning feel less transactional and more aspirational. The work turns a travel utility into an invitation to move, explore, and keep the energy of a trip alive. It gives the brand a clearer emotional role in a high-value customer's everyday life.",
  },
  'clarity-rcm.html': {
    headline: 'Revenue cycle expertise made unmistakable',
    copy: 'Clarity RCM helps dermatology practices recover revenue hiding inside operational complexity. The brand story makes the value plain to executives: cleaner billing, faster collections, and a healthier practice. The work gives a specialized service the confidence and sharpness of a category leader.',
  },
  'divine.html': {
    headline: 'A title world with prestige, dread, and scale',
    copy: 'Divine needed a visual language that could carry the weight of Dante without feeling academic. The title direction established an eerie, theatrical tone for a limited-run series, giving the show a memorable first impression and a premium visual world before the story even begins.',
  },
  'doppl-google-labs.html': {
    headline: 'Experimental fashion AI made instantly playful',
    copy: 'Doppl needed to make an early Google Labs experiment feel approachable, useful, and culturally alive. The work turns virtual try-on into a simple promise: explore any look before committing to it. It gives a technically complex feature the clarity and delight needed for mainstream curiosity.',
  },
  'driven-studios.html': {
    headline: 'A performance brand built for automotive culture',
    copy: 'Driven Studios needed to feel like part production company, part media platform, and fully credible to car obsessives. The identity uses speed, spectacle, and precision to create a brand that can sell premium content, attract partners, and command attention in a culture that notices every detail.',
  },
  'emotive-feels.html': {
    headline: 'A system for making emotion useful in brand strategy',
    copy: 'Emotive Feels visualizes the emotional territory behind strong brands. The experience gives teams a more tangible way to discuss feeling, memory, and differentiation, turning an abstract strategy conversation into something people can see, compare, and use. It is a tool for better decisions, not decoration.',
  },
  'evergrow.html': {
    headline: 'Clean-energy finance with infrastructure credibility',
    copy: 'Evergrow needed to make financing clean energy feel dependable, systematic, and built for scale. The redesign draws from infrastructure cues to signal precision and long-term trust. It gives a complex financial platform a brand language that can speak to investors, partners, and climate operators at once.',
  },
  'fender.html': {
    headline: 'Reframing Fender as a platform for modern creators',
    copy: "Fender needed a future-facing brand idea without losing its cultural authority. The work moves the story beyond legacy guitar mythology and toward a flexible suite of creative tools for a wider generation of makers. It protects the brand's heritage while opening a larger market conversation.",
  },
  'flimp.html': {
    headline: 'A benefits toolset organized for action',
    copy: 'Flimp turns scattered benefits communications into a clear system leaders can deploy with confidence. The brand makes the product feel practical, organized, and easy to scale across employee audiences. It helps HR and benefits teams move from explanation to engagement.',
  },
  'gameon.html': {
    headline: 'Fan engagement without operational drag',
    copy: 'GameOn needed to make its promise obvious to leaders responsible for growth and retention. The work positions the platform as a way to reach any fan, in any channel, without adding heavy operational burden. It turns automation into a more active, responsive fan relationship.',
  },
  'gitlab.html': {
    headline: 'Collaboration made visible for complex product teams',
    copy: "GitLab's value compounds as product operations become more complex. The work gives that collaboration story a clearer visual shape, making it easier for teams and leaders to see how shared workflows reduce friction. It reinforces GitLab as infrastructure for alignment, not just code.",
  },
  'google-maps-pegman.html': {
    headline: 'Turning a utility icon into a cultural participant',
    copy: 'Pegman is already globally recognized, so the opportunity was not awareness. It was relevance. The custom outfit system helped Google Maps show up inside high-profile cultural moments with charm and specificity, earning more than one million social impressions while keeping the character instantly recognizable.',
  },
  'granica.html': {
    headline: 'Data infrastructure with a visible sense of speed',
    copy: 'Granica needed to make data optimization feel immediate and differentiated. The brand system uses motion cues, a disciplined palette, and a robust 3D language to make speed visible even in static form. It gives a technical platform a sharper story for buyers evaluating performance at scale.',
  },
  'hoist.html': {
    headline: 'A new category for small business ownership',
    copy: 'Hoist began with an ambitious operational vision: change how people start and run small businesses. The work turned that vision into the Owner OS, then built the name, identity, website, and launch video around it. The result gave a startup a clearer category, not just a better look.',
  },
  'hybrid.html': {
    headline: 'A banking brand for people the category overlooks',
    copy: 'Hybrid needed to build trust in a part of finance where trust is hard-won. The brand balances compliance credibility with warmth, optimism, and human directness, creating a rare position in high-risk banking. It gives the company a radical but responsible alternative to category sameness.',
  },
  'ibm-watson.html': {
    headline: 'Global consistency for an AI business icon',
    copy: "IBM Watson needed a unified design language that could work across data visualization, motion, product interfaces, photography, illustration, and print. The system built from IBM's broader design foundation while giving Watson its own sense of energy and optimism, helping a complex AI platform show up coherently worldwide.",
  },
  'joyable.html': {
    headline: 'Mental health benefits made approachable at work',
    copy: "Joyable's pivot into employee healthcare required a brand that could make mental health feel credible, accessible, and less intimidating. The system uses the idea of windows into emotion to create a flexible language across product and marketing, helping employers address a serious problem with care and clarity.",
  },
  'kinemaster.html': {
    headline: 'Mobile creation positioned as a universal behavior',
    copy: 'Kinemaster needed to move beyond feature comparison and claim a bigger truth: everyone is creative when the tools meet them where they are. The work lowers the intimidation around making content and turns mobile editing into an empowering, everyday act for a global audience.',
  },
  'lightcone.html': {
    headline: 'Autonomous computer use made commercially legible',
    copy: 'Lightcone needed a launch video that made a complex computer-use agent feel immediately understandable to serious buyers. The story reframed the product as persistent infrastructure, not another chatbot demo. Continuity, autonomy, and reusable work became the signals that positioned Lightcone for teams thinking beyond novelty.',
  },
  'liveramp.html': {
    headline: 'A campaign built around choice and control',
    copy: 'LiveRamp needed a campaign that could show the breadth of its platform without drowning the message in complexity. The work turns flexibility into the central idea, giving enterprise buyers a clearer way to understand how the system adapts to their needs while maintaining control.',
  },
  'material.html': {
    headline: 'Security positioned around radical resilience',
    copy: 'Material entered the market with serious investors, credible customers, and a product story that deserved more than category camouflage. The brand translated its security advantage into a sharper position: radical resilience. It gave the company a launch presence that felt mature, memorable, and hard to confuse with competitors.',
  },
  'meet-elise.html': {
    headline: 'AI leasing made warmer and more useful',
    copy: 'Meet Elise needed to make a sophisticated leasing AI feel like a better housing experience, not a colder automation layer. The brand positions the product around better matches, faster responses, and less friction for both renters and property teams. It makes operational intelligence feel human.',
  },
  'microsoft-windows11.html': {
    headline: 'Dynamic wallpapers for a more personal desktop',
    copy: "Windows 11 needed moments of motion that could make the operating system feel fresh without distracting from work, streaming, or play. The dynamic wallpaper work adds personality and polish to the desktop experience, reinforcing Microsoft's shift toward a calmer, more expressive system.",
  },
  'moveworks.html': {
    headline: 'A stealth AI company launched with category confidence',
    copy: 'Moveworks needed to come out of stealth with a story big enough for the market it was creating. The work aligned positioning, identity, messaging, website, and launch experience around a simple promise: AI that resolves work instantly. It helped turn technical ambition into executive clarity.',
  },
  'notebook-lm-google.html': {
    headline: 'An AI research partner made useful for learning',
    copy: 'NotebookLM needed to make AI-assisted research feel trustworthy, practical, and easy to adopt. The work clarifies the product as a thinking partner that can turn lectures, chapters, and papers into explanations people can use. It moves the story from novelty to everyday learning value.',
  },
  'original-syndicate.html': {
    headline: 'Virtual production made accessible to modern creators',
    copy: 'Original Syndicate needed to make advanced production feel available to brands, agencies, and individual talent without losing its future-facing edge. The brand gives creators a clearer sense of the tools, workflows, and partnership behind the offering, positioning the studio as both expert and accelerator.',
  },
  'pagoda.html': {
    headline: 'A Web3 app platform with familiar entry points',
    copy: 'Pagoda needed to make Web3 app building feel less alien and more usable. The brand borrows recognizable app language, then remixes it into a new digital world. That tension helps founders and developers understand the platform quickly while still feeling the shift into a different ecosystem.',
  },
  'papa.html': {
    headline: 'Human connection positioned as healthcare infrastructure',
    copy: 'Papa needed to show health plans and employers that companionship is not a soft benefit, it is a practical support system. The brand story connects everyday help, transportation, and social connection to better member experience, giving a deeply human service the clarity of an enterprise solution.',
  },
  'phils.html': {
    headline: 'Refillable packaging framed as everyday behavior change',
    copy: "Phil's needed to make sustainable packaging feel simple enough to become routine. The work focuses on refillable containers for daily hygiene, turning a waste problem into a practical habit people can understand. It gives the brand a clear role in reducing unmanaged packaging without moralizing.",
  },
  'prometheus-group.html': {
    headline: 'Enterprise asset management for the whole plant',
    copy: 'Prometheus Group needed to make complex EAM software feel grounded in the operational realities of a plant. The messaging clarifies how the platform supports boots-on-the-ground teams while making assets and ERP systems more productive. It connects executive efficiency to frontline work.',
  },
  'rafa-racing-club.html': {
    headline: 'Luxury motorsport with the pulse of performance',
    copy: 'Rafa Racing Club needed a digital presence that could carry both athletic intensity and premium membership value. The site blends high-energy motion, sharp visuals, and a polished luxury cadence, helping the brand speak to elite motorsport enthusiasts who expect speed and taste in equal measure.',
  },
  'rightcapital.html': {
    headline: 'Financial planning software that feels easier to choose',
    copy: 'RightCapital needed to appeal to advisors and their clients at the same time. The brand breaks from the clunky conventions of financial planning software and uses arrows, lines, and forward motion to make planning feel clearer, lighter, and more confident. The result supports both adoption and trust.',
  },
  'snow.html': {
    headline: 'Technology intelligence with category-leader clarity',
    copy: 'Snow Software needed to communicate the breadth of its SaaS technology intelligence platform without overwhelming buyers. The work frames visibility across the technology ecosystem as a strategic advantage for IT and software asset leaders, helping the company look as established and useful as the category it leads.',
  },
  'tau.html': {
    headline: 'A metaverse brand for digital selves and incentives',
    copy: 'Tau needed to make an unfamiliar combination of crypto, ideology, communication, and digital identity feel coherent. The brand turns that complexity into a world where people can build a digital self, interact with information, and earn value. It gives an early metaverse platform a more legible narrative.',
  },
  'tripactions.html': {
    headline: 'Business travel positioned for the post-Covid rebound',
    copy: 'TripActions needed a campaign with the confidence to show up everywhere business travelers make decisions. The work positioned the platform as the do-it-all travel solution for a market ready to move again, creating a clear, high-visibility story across airports and other global touchpoints.',
  },
  'vita.html': {
    headline: 'Benefits strategy brought into harmony',
    copy: 'Vita needed to make benefits feel like a meaningful part of total rewards, not a compliance burden. The brand frames smarter benefits decisions as both human and commercial, helping leaders protect the business while giving employees a clearer sense of value.',
  },
  'wish-com.html': {
    headline: 'An employer brand for people who refuse ordinary',
    copy: "Wish needed to compete for developers in a brutal talent market. The employer brand turns the company's weird, energetic marketplace DNA into a hiring advantage, inviting candidates who want scale without blandness. It makes working at Wish feel distinctive before the first recruiter call.",
  },
};

function normalizeWhitespace(text) {
  return text.trim().replace(/\s+/g, ' ');
}

for (const [file, rewrite] of Object.entries(caseStudies)) {
  const htmlPath = path.join(PROJECT_HTML_DIR, file);
  const html = await readFile(htmlPath, 'utf-8');
  const $ = cheerio.load(html, { decodeEntities: false });
  const intro = $('.copysection.projectcopy').first();

  if (!intro.length) {
    continue;
  }

  const headline = intro.find('.mainline.smallhomesection').first();
  if (headline.length) {
    headline.text(rewrite.headline);
  } else {
    intro
      .find('.subline.homesub')
      .first()
      .after(`<h1 class="mainline smallhomesection">${rewrite.headline}</h1>`);
  }
  intro.find('.splitpara').first().text(rewrite.copy);

  await writeFile(htmlPath, `${$('body').html() ?? $.root().html()}\n`);

  const dataPath = path.join(PROJECT_DATA_DIR, file.replace(/\.html$/, '.json'));
  const data = JSON.parse(await readFile(dataPath, 'utf-8'));
  data.description = normalizeWhitespace(rewrite.copy);
  await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`);
}

console.log(`Rewrote ${Object.keys(caseStudies).length} case study intros.`);
