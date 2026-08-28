import type { ProjectGroupKey } from "@/content/projects";

// content/projects.ts의 projectGroups 영어 번역. media·links·stack 등
// 언어 무관 필드는 여기 없다 — lib/content/projects.ts의
// getProjectGroups(locale)가 항목 id로 매칭해 텍스트만 덮어씌운다.

type ProjectTranslation = {
  title: string;
  meta: string;
  why: string[];
  tags?: string[];
};

type GroupTranslation = {
  label: string;
  teaser: string;
  items: Record<string, ProjectTranslation>;
};

export const projectGroupsEn: Record<ProjectGroupKey, GroupTranslation> = {
  claudocs: {
    label: "Claudocs",
    teaser: "Electronic-document workspace SaaS",
    items: {
      claudocs: {
        title: "Claudocs",
        meta: "2025.11 – 2025.12 · Personal project, archived after production deployment",
        why: [
          "A personal project built during Fast Campus's backend bootcamp.",
          "I made it because signing and submitting PDF documents felt tedious.",
          "You lay out input fields and signature boxes on a PDF template,",
          "and workspace members can fill it in and send it back —",
          "a workspace SaaS that also supports review and approval.",
          "The service itself is archived, but the source is open on GitHub.",
        ],
        tags: ["Archived"],
      },
    },
  },
  langport: {
    label: "Langport",
    teaser: "Finding your next language-exchange meetup.",
    items: {
      langport: {
        title: "Langport",
        meta: "2026.07 – · Personal project, langport.vercel.app",
        why: [
          "Attending language-exchange meetups often, I kept running into the problem that",
          "they're scattered across Meetup, Instagram, and random web pages, which makes them a pain to find.",
          "Talking with a traveler at one of these meetups, it hit me that a service like Skyscanner or",
          "MyRealTrip — one place to see meetups scattered everywhere — would be great, so I spent about a week building it.",
        ],
        tags: ["Private repo"],
      },
    },
  },
  "claude-tools": {
    label: "Claude Code tools",
    teaser: "Making Claude Code more fun",
    items: {
      "claude-rpg-statusline": {
        title: "claude-rpg-statusline",
        meta: "2026.07 · Claude Code CLI tool",
        why: [
          "An RPG-themed statusline that shows Claude Code's usage limits.",
          "See your token and context limits right in the statusline.",
        ],
      },
      "personal-astrologer": {
        title: "personal-astrologer",
        meta: "2026.07 · Claude Code CLI tool",
        why: [
          "A personal-astrologer template that runs on top of Claude Code.",
          "Fill in your birth chart data in a local file, and it answers questions based on that.",
          "Fork it and fill in your own data, and anyone can run their own version.",
        ],
        tags: ["For fun & self-reflection"],
      },
    },
  },
};
