export const site = {
  name: "Mountain & Valley",
  shortName: "M&V",
  tagline: "A folding office for structures that ship flat.",
  description:
    "Mountain & Valley engineers crease patterns for shelters, solar arrays and packaging that ship flat and open into structure. Nothing added, nothing removed.",
  email: "hello@mountainandvalley.example",
} as const;

export const navigation = {
  label: "Site",
  home: "Mountain & Valley, back to the first step",
  contact: "Contact",
} as const;

export const startFlat = {
  step: "Step 1",
  name: "Start Flat",
  headline: ["Start with", "one sheet."],
  lead: "Take one sheet. Do not cut it. Do not glue it. We will know.",
  body: "Mountain & Valley is a folding office. We work out crease patterns for things that have to travel flat and arrive as structure: shelters, solar arrays, packaging.",
  hint: "Scroll to fold.",
} as const;

export const packSmall = {
  step: "Step 2",
  name: "Pack Small",
  headline: ["Pack it", "small."],
  body: "This is a Miura fold. Pull one corner and the whole sheet opens. Push, and it is the size of a paperback. One motion, no hinges, no instructions in six languages.",
  control: "Fold it yourself",
  open: "Open",
  packed: "Packed",
  readout: "Width, depth, height",
  flat: "3.40 × 2.40 × 0.00 m",
} as const;

export const standUp = {
  step: "Step 3",
  name: "Stand Up",
  headline: ["Stand", "it up."],
  body: "Turn the sheet over. Fold along the diagonals. It becomes a vault and holds itself up. Most meetings cannot.",
  projectsTitle: "Three we folded earlier",
  projects: [
    {
      name: "Field Shelter No. 4",
      text: "Sleeps six. Ships as a board 40 mm thick. Two people, four minutes, no poles.",
    },
    {
      name: "Array 12",
      text: "Twelve square metres of solar film. Leaves the truck as one sheet, opens with one pull.",
    },
    {
      name: "Flat Crate",
      text: "A shipping crate with no tape and no foam. Comes back folded. Survives the third trip.",
    },
  ],
  tagsTitle: "The vault, measured",
  tags: [
    { anchor: "crown", label: "Ridge: 2.1 m clear" },
    { anchor: "foot", label: "Foot: no anchors" },
    { anchor: "mouth", label: "Mouth: 3.4 m wide" },
  ],
} as const;

export const stayCreased = {
  step: "Step 4",
  name: "Stay Creased",
  headline: ["Unfold.", "It remembers."],
  body: "Fold along the valley. Unfold. The crease stays. That is the point.",
  processTitle: "How a job folds",
  process: [
    { name: "Brief", text: "Tell us what has to fit where. Bring the box." },
    { name: "Pattern", text: "We prove it folds flat before anyone bends anything." },
    { name: "Paper", text: "We fold it at desk scale. The bin fills up." },
    { name: "Material", text: "The same creases move to board, metal or film." },
  ],
} as const;

export const letGo = {
  step: "Step 5",
  name: "Let Go",
  headline: ["Let go."],
  body: "Five folds make a dart. The sixth step is not a fold. This is the hard one.",
  contactTitle: "Have something that must fit somewhere?",
  contactBody: "Send the dimensions and the deadline. We answer on paper when we can and by email when we must.",
  cta: "Throw it our way",
} as const;

export const footer = {
  note: "Mountain & Valley is a fictional studio. This is a concept site.",
  creditLabel: "Design & build",
} as const;

export const credit = {
  // PLACEHOLDER: replace with your name.
  name: "YOUR NAME",
  // PLACEHOLDER: replace with your link.
  href: "https://example.com",
} as const;
