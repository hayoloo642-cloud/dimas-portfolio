/* ============================================================
   ICON SET — SVG only, no emoji, no symbol fonts
   ============================================================ */
const ICONS = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.55v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.18-1.49 3.14-1.18 3.14-1.18.63 1.58.24 2.75.12 3.04.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.2.66.8.55A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6.5 0h3.8v1.7h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21h-4V9Z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.3 9.3 0 0 1-3.3-.6L3 21l1.7-4.7a8.3 8.3 0 0 1-.7-3.4 8.4 8.4 0 0 1 8.5-8.3 8.4 8.4 0 0 1 8.5 8.3Z"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.2 2h6.4l4.4 5.9L18.9 2Zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20Z"/></svg>',
  dribbble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9.2"/><path d="M5 7.5c3.6 3 6.6 7.4 8 13M3.2 13.6c4.5-.4 9.2.6 12.4 3.6M8.2 3.4c3 2.6 5.6 6.8 6.4 11.2.2 1.3 3.4-.6 6.1-2.6"/></svg>',
  behance: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.1 11.4c.9-.5 1.4-1.3 1.4-2.4 0-2.2-1.6-3.2-4-3.2H1v12.3h5.8c2.6 0 4.3-1.2 4.3-3.6 0-1.4-.7-2.6-2-3.1ZM3.7 8.3h2.5c1 0 1.6.5 1.6 1.3s-.6 1.3-1.6 1.3H3.7V8.3Zm2.7 7.4H3.7v-2.9h2.7c1.2 0 1.9.6 1.9 1.5s-.7 1.4-1.9 1.4ZM18.2 8.6c-3 0-5.1 2.1-5.1 5s2 5 5.2 5c2.6 0 4.3-1.3 4.7-3.3h-2.5c-.2.8-.9 1.3-2.1 1.3-1.3 0-2.2-.8-2.4-2.2h7.1c0-.2.1-.5.1-.8 0-3-2-5-5-5Zm-2.2 4c.2-1.2 1-2 2.2-2s2 .7 2.1 2h-4.3ZM15.5 6h5.2v1.6h-5.2V6Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2.2" y="5.5" width="19.6" height="13" rx="4"/><path d="m10.2 9.4 5 2.6-5 2.6V9.4Z" fill="currentColor"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 13.5a4.5 4.5 0 0 0 6.4 0l2.6-2.6a4.5 4.5 0 0 0-6.4-6.4L11.4 6"/><path d="M14 10.5a4.5 4.5 0 0 0-6.4 0L5 13.1a4.5 4.5 0 0 0 6.4 6.4l1.2-1.2"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',

  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/></svg>',
  server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3.5" width="18" height="7" rx="2"/><rect x="3" y="13.5" width="18" height="7" rx="2"/><path d="M7 7h.01M7 17h.01M11 7h4M11 17h4"/></svg>',
  pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 19l7-7 2 2-7 7-2-2Z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5Z"/><path d="m2 2 7.6 7.6"/><circle cx="11" cy="11" r="2"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5L3.5 11 10 9l2-6.5Z"/><path d="M18.5 16.5 19.5 19l2.5 1-2.5 1-1 2.5-1-2.5L15 20l2.5-1 1-2.5Z"/></svg>',

  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8.5h3l1.5-2.5h9L18 8.5h3v11H3v-11Z"/><circle cx="12" cy="14" r="3.6"/></svg>',
  music: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.6"/><circle cx="17.5" cy="16" r="2.6"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4.5h6a3 3 0 0 1 3 3V21a2.5 2.5 0 0 0-2.5-2.5H4v-14Z"/><path d="M20 4.5h-6a3 3 0 0 0-3 3V21a2.5 2.5 0 0 1 2.5-2.5H20v-14Z"/></svg>',
  run: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="15" cy="4.5" r="2"/><path d="M13 9 9 11l-1 4M13 9l3 2 3-1M13 9l-1 5 3 2-1 5M8 21l1-4"/></svg>',
  coffee: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2M3 22h16"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>',
  image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m4 17 4.5-4.5 3.5 3 4-4.5 4 4"/></svg>',
  type: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 5h14M12 5v15M9 20h6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 21c1.3-3.6 4.2-5.4 7.5-5.4s6.2 1.8 7.5 5.4"/></svg>',
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7.5a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.5Z"/></svg>',
  award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-2 7.5 5.5-2.5 5.5 2.5-2-7.5"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></svg>',
  close: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  plus: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 5v14M5 12h14"/></svg>',
  up: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  down: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 5v14M6 13l6 6 6-6"/></svg>',
  grip: '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>',
  drag: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 6h6M9 12h6M9 18h6"/></svg>',
  trash: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>',
  upload: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 20V8M7 12l5-5 5 5M4 20h16"/></svg>',
  magic: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m5 19 9-9M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z"/></svg>',
  save: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 4h11l3 3v13H5V4ZM9 4v6h6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>',
  logout: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 4h6v16h-6M10 12l6-6M16 18l-6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12.5 4.5 4.5 9.5-9.5"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 2h-3.1v13.2a2.7 2.7 0 1 1-2.7-2.7c.28 0 .55.04.8.12V9.5a5.9 5.9 0 0 0-.8-.05 5.8 5.8 0 1 0 5.8 5.8V8.2a6.4 6.4 0 0 0 3.9 1.3V6.4a3.6 3.6 0 0 1-3.9-3.5V2Z"/></svg>',
  arrowUpRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5l7 7-7 7"/></svg>'
};

const SOCIAL_ICONS = ["github", "linkedin", "instagram", "x", "dribbble", "behance", "youtube", "mail", "chat", "link"];
const SKILL_ICONS = ["code", "server", "pen", "spark", "grid", "type", "camera", "music", "book", "run", "coffee", "folder"];
