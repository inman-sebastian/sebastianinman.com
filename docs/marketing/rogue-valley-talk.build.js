const pptxgen = require("pptxgenjs");

/**
 * Sebastian's talk for a room of Rogue Valley business owners.
 *
 * Voice rules from CLAUDE.md: plain language, no jargon, no em dashes,
 * warm not corporate, no AI hype, honest about what is not worth doing.
 * He speaks over these, so one idea per slide and few words. The room is
 * local, so nothing here says "based in Southern Oregon"; they know.
 *
 * Construction rule, learned the hard way: every card is ONE object with
 * its text inside, never a shape with a separate text box laid on top.
 * The first version stacked them, and viewers that cache shapes by id
 * (pptxgenjs restarts ids at 2 on every slide) composited cards from one
 * slide onto another. Fewer objects, nothing to bleed.
 */

// Brand, straight from app/globals.css
const CREAM = "FAF6EF";
const SURFACE = "FFFDF8";
const INK = "2B2620";
const MUTED = "6B6257";
const PINE = "234F3E";
const PINE_DARK = "18382C";
const PINE_TINT = "E9F0EA";
const TERRA = "C05F33";
const TERRA_DARK = "A54D26";
const TERRA_TINT = "F7E7DB";
const LINE = "E7DFD2";

const HEAD = "Cambria";
const BODY = "Calibri";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Sebastian Inman";
pres.title = "The busywork worth fixing";

const M = 0.7;
const W = 13.33 - M * 2;

/** Cream slide with a title, the workhorse layout */
function slideWithTitle(title, opts = {}) {
  const s = pres.addSlide();
  s.background = { color: opts.tint ? PINE_TINT : CREAM };
  s.addText(title, {
    isTextBox: true,
    x: M,
    y: 0.55,
    w: W,
    h: 0.9,
    fontFace: HEAD,
    fontSize: 38,
    bold: true,
    color: PINE_DARK,
    margin: 0,
  });
  return s;
}

/** A card: one object, heading and body as runs inside it */
function card(slide, { x, y, w, h, heading, body, tint }) {
  slide.addText(
    [
      {
        text: heading,
        options: {
          fontFace: HEAD,
          fontSize: tint ? 20 : 21,
          bold: true,
          color: tint ? TERRA_DARK : PINE_DARK,
          breakLine: true,
        },
      },
      { text: " ", options: { fontSize: 9, breakLine: true } },
      {
        text: body,
        options: { fontFace: BODY, fontSize: 14.5, color: tint ? INK : MUTED },
      },
    ],
    {
      shape: pres.ShapeType.roundRect,
      rectRadius: 0.13,
      fill: { color: tint ? TERRA_TINT : SURFACE },
      line: { color: tint ? "EBD3C2" : LINE, width: 1 },
      x,
      y,
      w,
      h,
      valign: "top",
      margin: 14,
      isTextBox: true,
    }
  );
}

/* 1 - title --------------------------------------------------------- */
{
  const s = pres.addSlide();
  s.background = { color: PINE_DARK };
  s.addText(
    [
      { text: "The busywork", options: { color: CREAM, breakLine: true } },
      { text: "worth fixing", options: { color: TERRA } },
    ],
    {
      isTextBox: true,
      x: M,
      y: 1.95,
      w: W,
      h: 2.1,
      fontFace: HEAD,
      fontSize: 54,
      bold: true,
      lineSpacing: 62,
      margin: 0,
    }
  );
  s.addText(
    "Which repetitive jobs in a small business are actually worth handing to software, and which ones are not.",
    {
      isTextBox: true,
      x: M,
      y: 4.35,
      w: 9.4,
      h: 0.8,
      fontFace: BODY,
      fontSize: 17,
      color: "C9D6CD",
      margin: 0,
    }
  );
  s.addText("Sebastian Inman", {
    isTextBox: true,
    x: M,
    y: 6.3,
    w: W,
    h: 0.4,
    fontFace: BODY,
    fontSize: 15,
    color: "9FB3A6",
    margin: 0,
  });
  s.addNotes(
    "Introduce yourself in one sentence. Say up front that this talk is meant to be useful whether or not anyone ever calls you."
  );
}

/* 2 - what this is -------------------------------------------------- */
{
  const s = slideWithTitle("Before we start");
  const points = [
    [
      "This is not a sales pitch.",
      "By the end you should be able to spot the jobs worth automating on your own, and do some of them yourself.",
    ],
    [
      "I will tell you what is not worth doing.",
      "Most of what gets sold as automation is not worth the money for a business your size. I would rather say so.",
    ],
    [
      "No jargon.",
      "If I use a word that only makes sense to software people, stop me.",
    ],
  ];
  points.forEach(([head, sub], i) => {
    const y = 1.95 + i * 1.45;
    s.addText(String(i + 1), {
      shape: pres.ShapeType.ellipse,
      fill: { color: TERRA },
      x: M,
      y: y + 0.02,
      w: 0.44,
      h: 0.44,
      align: "center",
      valign: "middle",
      fontFace: BODY,
      fontSize: 15,
      bold: true,
      color: "FFFFFF",
      margin: 0,
      isTextBox: true,
    });
    s.addText(
      [
        {
          text: head,
          options: {
            fontFace: HEAD,
            fontSize: 22,
            bold: true,
            color: PINE_DARK,
            breakLine: true,
          },
        },
        { text: sub, options: { fontFace: BODY, fontSize: 15, color: MUTED } },
      ],
      {
        isTextBox: true,
        x: M + 0.78,
        y,
        w: 10.9,
        h: 1.15,
        lineSpacing: 24,
        margin: 0,
      }
    );
  });
  s.addNotes("Say the first one out loud. It buys you the room's attention.");
}

/* 3 - the problem, in their words ------------------------------------ */
{
  const s = slideWithTitle("Sound familiar?");
  const phrases = [
    "Retyping the same customer info",
    "Chasing late invoices",
    "Missed calls after hours",
    "Books that do not match the register",
    "Sending the same email again",
    "Manual appointment reminders",
    "Answering the same question, again",
    "Late-night paperwork",
  ];
  const cols = 4;
  const cw = (W - 0.3 * 3) / cols;
  phrases.forEach((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    s.addText(p, {
      shape: pres.ShapeType.roundRect,
      rectRadius: 0.12,
      fill: { color: SURFACE },
      line: { color: LINE, width: 1 },
      x: M + col * (cw + 0.3),
      y: 1.95 + row * 1.6,
      w: cw,
      h: 1.35,
      valign: "middle",
      fontFace: BODY,
      fontSize: 16,
      color: INK,
      margin: 14,
      isTextBox: true,
    });
  });
  s.addText(
    "Every one of these is the same thing: a job you do the same way every time.",
    {
      isTextBox: true,
      x: M,
      y: 5.35,
      w: W,
      h: 0.4,
      fontFace: BODY,
      fontSize: 16,
      italic: true,
      color: MUTED,
      margin: 0,
    }
  );
  s.addNotes("Ask for a show of hands on a couple of these. Get them talking.");
}

/* 4 - the definition -------------------------------------------------- */
{
  const s = slideWithTitle("What automation actually means", { tint: true });
  s.addText(
    "Software doing a job you would otherwise do by hand,\nthe same way, every time.",
    {
      isTextBox: true,
      x: M,
      y: 2.3,
      w: W,
      h: 1.6,
      fontFace: HEAD,
      fontSize: 32,
      bold: true,
      color: PINE,
      lineSpacing: 46,
      margin: 0,
    }
  );
  s.addText(
    "That is the whole idea. It is not robots, it is not replacing anybody, and for most of what I do it is not even particularly clever. It is a computer typing something so you do not have to.",
    {
      isTextBox: true,
      x: M,
      y: 4.25,
      w: 10.9,
      h: 1.2,
      fontFace: BODY,
      fontSize: 17,
      color: INK,
      margin: 0,
    }
  );
  s.addNotes("Slow down here. This is the slide that removes the fear.");
}

/* 5 - the test (the takeaway) ----------------------------------------- */
{
  const s = slideWithTitle("The test I use");
  s.addText(
    "Three questions. If a job answers yes to all three, it is worth looking at.",
    {
      isTextBox: true,
      x: M,
      y: 1.5,
      w: W,
      h: 0.4,
      fontFace: BODY,
      fontSize: 16,
      color: MUTED,
      margin: 0,
    }
  );
  const qs = [
    [
      "Does it happen every week?",
      "Once a quarter is not worth anybody's money to fix.",
    ],
    [
      "Does it follow the same steps?",
      "If you decide something different every time, it needs you.",
    ],
    [
      "Does getting it wrong cost you?",
      "A missed follow-up costs a customer. A typo in a note does not.",
    ],
  ];
  const cw = (W - 0.4 * 2) / 3;
  qs.forEach(([q, sub], i) => {
    card(s, {
      x: M + i * (cw + 0.4),
      y: 2.15,
      w: cw,
      h: 2.75,
      heading: q,
      body: sub,
    });
  });
  s.addText("Write this down. It is the useful part of the talk.", {
    isTextBox: true,
    x: M,
    y: 5.25,
    w: W,
    h: 0.4,
    fontFace: BODY,
    fontSize: 16,
    italic: true,
    color: TERRA,
    margin: 0,
  });
  s.addNotes("This is the slide people photograph. Pause and let them.");
}

/* 6 - in practice ----------------------------------------------------- */
{
  const s = slideWithTitle("What it looks like in practice");
  const rows = [
    [
      "Someone calls while you are with a customer",
      "They get a text back within seconds, with your hours and a booking link",
    ],
    [
      "You type a new customer into three programs",
      "You type it once and the other two fill themselves in",
    ],
    [
      "You chase the same three invoices every month",
      "The reminder goes out on its own, politely, until they pay",
    ],
  ];
  rows.forEach(([before, after], i) => {
    const y = 1.9 + i * 1.5;
    s.addText(before, {
      isTextBox: true,
      x: M,
      y,
      w: 5.2,
      h: 1.1,
      valign: "middle",
      fontFace: BODY,
      fontSize: 16,
      color: MUTED,
      margin: 0,
    });
    s.addText(" ", {
      shape: pres.ShapeType.rightArrow,
      fill: { color: TERRA },
      x: M + 5.45,
      y: y + 0.37,
      w: 0.5,
      h: 0.34,
      isTextBox: true,
    });
    s.addText(after, {
      isTextBox: true,
      x: M + 6.25,
      y,
      w: W - 6.25,
      h: 1.1,
      valign: "middle",
      fontFace: BODY,
      fontSize: 16,
      bold: true,
      color: PINE_DARK,
      margin: 0,
    });
  });
  s.addNotes("Pick whichever of these matches the trades in the room.");
}

/* 7 - what is not worth it -------------------------------------------- */
{
  const s = slideWithTitle("What is not worth automating");
  const items = [
    [
      "Anything you do twice a year",
      "The setup costs more than the job ever will. Do it by hand and forget it.",
    ],
    [
      "Anything that changes every time",
      "If it needs a judgement call, it needs you. Software is bad at judgement and expensive at pretending.",
    ],
    [
      "The part your customers come for",
      "Nobody chose you because your confirmation email was quick. Automate around the relationship, never through it.",
    ],
  ];
  items.forEach(([head, sub], i) => {
    card(s, {
      x: M,
      y: 1.8 + i * 1.62,
      w: W,
      h: 1.42,
      heading: head,
      body: sub,
      tint: true,
    });
  });
  s.addNotes(
    "This is the slide that earns trust. Say plainly that you turn work down when it fails these."
  );
}

/* 8 - what it costs ---------------------------------------------------- */
{
  const s = slideWithTitle("What this kind of work costs");
  s.addText("Real numbers, so nobody has to guess whether this is for them.", {
    isTextBox: true,
    x: M,
    y: 1.5,
    w: W,
    h: 0.4,
    fontFace: BODY,
    fontSize: 16,
    color: MUTED,
    margin: 0,
  });
  const prices = [
    ["$500", "Connecting two tools you already pay for"],
    ["$750", "Automating one repetitive job"],
    ["$1,000", "An assistant that answers after hours"],
    ["$2,000", "A new website that brings in customers"],
  ];
  const cw = (W - 0.3 * 3) / 4;
  prices.forEach(([amount, what], i) => {
    s.addText(
      [
        {
          text: amount,
          options: {
            fontFace: HEAD,
            fontSize: 34,
            bold: true,
            color: PINE,
            breakLine: true,
          },
        },
        { text: " ", options: { fontSize: 10, breakLine: true } },
        {
          text: what,
          options: { fontFace: BODY, fontSize: 14.5, color: MUTED },
        },
      ],
      {
        shape: pres.ShapeType.roundRect,
        rectRadius: 0.13,
        fill: { color: SURFACE },
        line: { color: LINE, width: 1 },
        x: M + i * (cw + 0.3),
        y: 2.2,
        w: cw,
        h: 2.4,
        valign: "top",
        margin: 14,
        isTextBox: true,
      }
    );
  });
  s.addText(
    "Flat prices, agreed before anything starts. No hourly billing and no surprise line items.",
    {
      isTextBox: true,
      x: M,
      y: 4.95,
      w: W,
      h: 0.4,
      fontFace: BODY,
      fontSize: 15,
      italic: true,
      color: MUTED,
      margin: 0,
    }
  );
  s.addNotes(
    "Say the numbers out loud. Most of the room expects them to be far higher."
  );
}

/* 9 - start Monday ------------------------------------------------------ */
{
  const s = slideWithTitle("What to do Monday morning", { tint: true });
  const steps = [
    "Write down every job you did more than twice last week.",
    "Cross off the ones that needed a decision. Those are yours to keep.",
    "Of what is left, pick the one that annoyed you most. Start there.",
  ];
  steps.forEach((step, i) => {
    const y = 2.05 + i * 1.2;
    s.addText(String(i + 1), {
      shape: pres.ShapeType.ellipse,
      fill: { color: PINE },
      x: M,
      y,
      w: 0.55,
      h: 0.55,
      align: "center",
      valign: "middle",
      fontFace: BODY,
      fontSize: 18,
      bold: true,
      color: "FFFFFF",
      margin: 0,
      isTextBox: true,
    });
    s.addText(step, {
      isTextBox: true,
      x: M + 0.95,
      y: y - 0.05,
      w: W - 0.95,
      h: 0.7,
      valign: "middle",
      fontFace: BODY,
      fontSize: 19,
      color: INK,
      margin: 0,
    });
  });
  s.addText("You do not need me for any of that.", {
    isTextBox: true,
    x: M,
    y: 5.75,
    w: W,
    h: 0.4,
    fontFace: BODY,
    fontSize: 17,
    italic: true,
    color: PINE,
    margin: 0,
  });
  s.addNotes("End the useful part here. The next slide is the only ask.");
}

/* 10 - close ------------------------------------------------------------ */
{
  const s = pres.addSlide();
  s.background = { color: PINE_DARK };
  s.addText("If you get stuck on one of them,\nthe coffee is on me.", {
    isTextBox: true,
    x: M,
    y: 2.2,
    w: 11.4,
    h: 1.8,
    fontFace: HEAD,
    fontSize: 38,
    bold: true,
    color: CREAM,
    lineSpacing: 52,
    margin: 0,
  });
  s.addText(
    "One person, not an agency. I will tell you when something is not worth doing.",
    {
      isTextBox: true,
      x: M,
      y: 4.3,
      w: 10.4,
      h: 0.6,
      fontFace: BODY,
      fontSize: 17,
      color: "C9D6CD",
      margin: 0,
    }
  );
  s.addText("sebastianinman.com", {
    isTextBox: true,
    x: M,
    y: 5.5,
    w: 6,
    h: 0.45,
    fontFace: HEAD,
    fontSize: 22,
    bold: true,
    color: TERRA,
    margin: 0,
  });
  s.addText("hello@sebastianinman.com  ·  (541) 592-9047", {
    isTextBox: true,
    x: M,
    y: 6.05,
    w: 8,
    h: 0.4,
    fontFace: BODY,
    fontSize: 15,
    color: "9FB3A6",
    margin: 0,
  });
  s.addNotes("Leave this up during questions.");
}

pres
  .writeFile({ fileName: "/tmp/deckbuild/rogue-valley-talk.pptx" })
  .then(() => console.log("written"));
