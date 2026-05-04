export interface BookPage {
  type: 'chapter-start' | 'body' | 'pull-quote';
  chapterNumber?: number;
  chapterTitle?: string;
  content: string;
}

export const bookText = `Perfect Years
By Salami Oreoluwa

[CHAPTER:1:The Weight of Expectation]

I was seventeen when I first understood that time is not a promise. It is a question we spend our whole lives answering. Before that, I had moved through my years the way most young people do — believing that the future was something that happened to you, not something you built. I thought perfect years were given, not earned.

Growing up in Nigeria, you learn quickly that the world does not slow down for your questions. There is always a next step, a next exam, a next expectation. Primary school leads to secondary school. Secondary school leads to JAMB. JAMB leads to university. And university, you are told, leads to the life you have been waiting for. But nobody tells you what to do when you arrive at each milestone and still feel like the same person who started the journey.

I wrote the first words of this book sitting on a wooden bench behind my parents' house. It was the dry season, and the harmattan had turned everything the color of dust. My notebook was small, the kind you buy for fifty naira at any shop in Lagos. I wrote because I had questions that no one around me seemed to be asking. About purpose. About pressure. About the gap between who we are told to become and who we actually are.

The weight of expectation is heaviest when you are carrying someone else's dream. I watched friends break under it — brilliant, capable young people who chose courses their parents wanted, careers that looked good at dinner parties, lives that fit neatly into other people's stories. I could not judge them. The pressure to conform is real, and the people applying it often love you deeply. They want security for you. They want pride. They want to know that their own sacrifices meant something.

But I am writing this for the ones who feel a different pull. The ones who hear a voice that does not sound like their parents' voice, their teachers' voice, or the voice of anyone who has ever given them advice. The voice that says: there is something else for you. Something specific. Something only you can build.

[CHAPTER:2:The Fire You Carry]

Every person is born with a fire inside them. I believe this with everything I have. It is not a metaphor — it is a real force, a current of energy and curiosity and desire that makes you want to create, to lead, to become more than you are today. The problem is that most fires get dimmed before they ever get a chance to burn properly.

Schools do not teach you to find your fire. They teach you to memorize, to comply, to perform well on standardized tests. These are not useless skills, but they are not the skills of a person who intends to build something original. The fire requires something different. It requires you to pay attention to what excites you when no one is watching. What problems do you gravitate toward? What conversations make you lose track of time? What work would you do for free if money were not a concern?

I found my fire at the intersection of three things: writing, leadership, and faith. Writing because it was the only way I could make sense of my thoughts. Leadership because I could not stand seeing problems that no one was fixing. Faith because it gave me a foundation deeper than my own understanding. Your intersection will be different. That is the point. The fire is unique to each person because each person is unique.

[PULLQUOTE:The fear of staying the same is worse than the fear of change.]

The question is not whether you have a fire. The question is whether you will let it out. Most people spend their lives keeping it contained — afraid of what will happen if they actually try, afraid of failure, afraid of the unknown that comes with pursuing something that matters. I understand the fear. I have felt it every time I have stepped into a new challenge. But I have learned something: the fear of staying the same is worse than the fear of change. The pain of a dimmed fire, endured over decades, is heavier than any temporary discomfort of growth.

[CHAPTER:3:Perfect Is Not the Goal]

The title of this book is ironic. I am seventeen years old. I have not lived perfect years. I have lived years full of mistakes, wrong turns, confusion, and the occasional moment of clarity that made everything else worth it. But I am learning that perfect is not the goal. Growth is the goal. Faithfulness is the goal. Showing up, day after day, and doing what you can with what you have — that is the goal.

Perfectionism is a trap. It sounds like a virtue, especially in a culture that celebrates excellence. But there is a difference between excellence and perfection. Excellence is doing your best with the resources you have. Perfection is an impossible standard that keeps you from starting. I have met too many talented people who never began their work because they were waiting for the perfect moment, the perfect plan, the perfect conditions. Those things do not exist. The only perfect moment is the one where you decide to begin anyway.

I started writing this book with no publishing deal, no platform, no guarantee that anyone would read it. I wrote it because the words were inside me and they needed to come out. That is how all meaningful work begins — not with certainty, but with conviction. Not with a blueprint, but with a belief that the work matters even if you cannot see the full path yet.

So this book is not a recipe for perfect years. It is an invitation to intentional years. Years where you pay attention. Years where you act on what you believe. Years where you fail forward, learn deeply, and keep moving toward the person you are meant to become.

[CHAPTER:4:Built to Build]

I have a theory about human beings. I think we are happiest when we are building something. Not consuming. Not watching. Not waiting. Building. There is a satisfaction that comes from creation that no passive pleasure can match. When you build, you are participating in the work of the universe — bringing order from chaos, making something exist that did not exist before.

For some people, building means writing code. For others, it means writing poems. Some build companies. Some build families. Some build movements that change nations. The form does not matter as much as the fact of creation. What matters is that you are using your hands, your mind, your heart to add something to the world.

I started KLiP — Kingdom Leaders in Politics — because I believed that Nigeria needed young people who were willing to build something in the political space. Not just complain. Not just tweet. Build. Create structures, develop competence, show up with integrity, and demonstrate that governance can be done differently. The Ignition Movement came from the same impulse — a belief that every young person carries potential that just needs to be unlocked.

Building is harder than criticizing. It requires patience, resources, and the willingness to look foolish when your first attempts do not work. But building is also the only thing that actually changes the world. Criticism identifies problems. Building solves them.

[CHAPTER:5:The Long Road]

This is the final chapter of a short book, but it is not the final chapter of the story. I am seventeen. The road ahead is long, and I do not pretend to know exactly where it leads. But I have learned a few things that I want to leave with you.

First, your age is not a limitation. It is a season. Do not let anyone tell you that you are too young to matter, too young to lead, too young to build something significant. The world needs young energy, young ideas, young courage. Every older person who changed the world was young once, and many of them started before anyone thought they were ready.

Second, your fire is real. Do not let anyone dim it. Not well-meaning relatives. Not skeptical friends. Not a culture that sometimes seems to reward conformity more than creativity. Protect your fire. Feed it with good inputs — good books, good people, good experiences. And then let it out into the world, even when you are afraid.

[PULLQUOTE:Perfect years are not the point. Intentional years are the point.]

Third, perfect years are not the point. Intentional years are the point. Years where you show up. Years where you try. Years where you fail and get back up. Years where you slowly, steadily become the person you were designed to be.

I am Salami Oreoluwa. I am seventeen years old. And I am just getting started.

Thank you for reading.
`;

export const bookPages = parseAndPaginate(bookText);


export interface ParsedPage {
  type: 'cover' | 'chapter-opener' | 'body' | 'pull-quote' | 'back-cover';
  chapterNumber?: number;
  chapterTitle?: string;
  content?: string;
  quote?: string;
}

export function parseAndPaginate(text: string, wordsPerPage: number = 260): ParsedPage[] {
  const pages: ParsedPage[] = [];
  const lines = text.split('\n');

  let bodyBuffer: string[] = [];
  let wordCount = 0;

  const flushBuffer = () => {
    if (bodyBuffer.length === 0) return;
    const content = bodyBuffer.join('\n').trim();
    if (content) pages.push({ type: 'body', content });
    bodyBuffer = [];
    wordCount = 0;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (bodyBuffer.length) bodyBuffer.push('');
      continue;
    }

    // Chapter marker
    const chapterMatch = trimmed.match(/^\[CHAPTER:(\d+):(.+)\]$/);
    if (chapterMatch) {
      flushBuffer();
      pages.push({
        type: 'chapter-opener',
        chapterNumber: parseInt(chapterMatch[1]),
        chapterTitle: chapterMatch[2],
      });
      continue;
    }

    // Pull quote marker
    const quoteMatch = trimmed.match(/^\[PULLQUOTE:(.+)\]$/);
    if (quoteMatch) {
      flushBuffer();
      pages.push({ type: 'pull-quote', quote: quoteMatch[1] });
      continue;
    }

    // Skip title lines
    if (trimmed === 'Perfect Years' || trimmed.startsWith('By ')) continue;

    // Regular body text — accumulate and paginate
    const words = trimmed.split(/\s+/);
    bodyBuffer.push(trimmed);
    wordCount += words.length;

    if (wordCount >= wordsPerPage) {
      // Try to break at sentence boundary
      const fullText = bodyBuffer.join(' ');
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
      let chunk = '';
      let remaining = '';
      let built = 0;

      for (const s of sentences) {
        const w = s.split(/\s+/).length;
        if (built + w <= wordsPerPage + 30) {
          chunk += s;
          built += w;
        } else {
          remaining += s;
        }
      }

      if (chunk.trim()) pages.push({ type: 'body', content: chunk.trim() });
      bodyBuffer = remaining.trim() ? [remaining.trim()] : [];
      wordCount = bodyBuffer.join(' ').split(/\s+/).length;
    }
  }

  flushBuffer();
  return pages;
}

// To add more chapters — just add [CHAPTER:6:Your Title] in book-text.ts and a matching entry in the CHAPTERS array at the top of Book.tsx.