import { Icon } from "@raycast/api";

/**
 * Application icon mapping interface
 */
export interface ApplicationIconMapping {
  bundleId: string;
  name: string;
  icon: Icon;
  category:
    | "development"
    | "browser"
    | "communication"
    | "design"
    | "productivity"
    | "media"
    | "system"
    | "other";
}

/**
 * Comprehensive mapping of popular applications to Raycast native icons
 */
export const APPLICATION_ICON_MAPPINGS: ApplicationIconMapping[] = [
  // Development Tools
  {
    bundleId: "com.microsoft.VSCode",
    name: "Visual Studio Code",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.jetbrains.intellij",
    name: "IntelliJ IDEA",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.jetbrains.WebStorm",
    name: "WebStorm",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.jetbrains.PyCharm",
    name: "PyCharm",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.apple.dt.Xcode",
    name: "Xcode",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.github.atom",
    name: "Atom",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.sublimetext.3",
    name: "Sublime Text",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.panic.Nova",
    name: "Nova",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.coteditor.CotEditor",
    name: "CotEditor",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.barebones.bbedit",
    name: "BBEdit",
    icon: Icon.Code,
    category: "development",
  },

  // Web Browsers
  {
    bundleId: "com.google.Chrome",
    name: "Google Chrome",
    icon: Icon.Globe,
    category: "browser",
  },
  {
    bundleId: "com.apple.Safari",
    name: "Safari",
    icon: Icon.Globe,
    category: "browser",
  },
  {
    bundleId: "org.mozilla.firefox",
    name: "Firefox",
    icon: Icon.Globe,
    category: "browser",
  },
  {
    bundleId: "com.microsoft.edgemac",
    name: "Microsoft Edge",
    icon: Icon.Globe,
    category: "browser",
  },
  {
    bundleId: "com.operasoftware.Opera",
    name: "Opera",
    icon: Icon.Globe,
    category: "browser",
  },
  {
    bundleId: "com.brave.Browser",
    name: "Brave Browser",
    icon: Icon.Globe,
    category: "browser",
  },
  {
    bundleId: "org.chromium.Chromium",
    name: "Chromium",
    icon: Icon.Globe,
    category: "browser",
  },
  {
    bundleId: "com.vivaldi.Vivaldi",
    name: "Vivaldi",
    icon: Icon.Globe,
    category: "browser",
  },

  // Communication
  {
    bundleId: "com.tinyspeck.slackmacgap",
    name: "Slack",
    icon: Icon.Message,
    category: "communication",
  },
  {
    bundleId: "com.microsoft.teams",
    name: "Microsoft Teams",
    icon: Icon.Message,
    category: "communication",
  },
  {
    bundleId: "us.zoom.xos",
    name: "Zoom",
    icon: Icon.Video,
    category: "communication",
  },
  {
    bundleId: "com.skype.skype",
    name: "Skype",
    icon: Icon.Video,
    category: "communication",
  },
  {
    bundleId: "com.discord.Discord",
    name: "Discord",
    icon: Icon.Message,
    category: "communication",
  },
  {
    bundleId: "com.apple.MobileSMS",
    name: "Messages",
    icon: Icon.Message,
    category: "communication",
  },
  {
    bundleId: "com.apple.mail",
    name: "Mail",
    icon: Icon.Envelope,
    category: "communication",
  },
  {
    bundleId: "com.microsoft.Outlook",
    name: "Microsoft Outlook",
    icon: Icon.Envelope,
    category: "communication",
  },
  {
    bundleId: "com.freron.MailMate",
    name: "MailMate",
    icon: Icon.Envelope,
    category: "communication",
  },
  {
    bundleId: "com.postbox-inc.postboxexpress",
    name: "Postbox",
    icon: Icon.Envelope,
    category: "communication",
  },

  // Design Tools
  {
    bundleId: "com.adobe.photoshop",
    name: "Adobe Photoshop",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.adobe.illustrator",
    name: "Adobe Illustrator",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.adobe.AfterEffects",
    name: "Adobe After Effects",
    icon: Icon.Video,
    category: "design",
  },
  {
    bundleId: "com.adobe.PremierePro",
    name: "Adobe Premiere Pro",
    icon: Icon.Video,
    category: "design",
  },
  {
    bundleId: "com.figma.Desktop",
    name: "Figma",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.bohemiancoding.sketch3",
    name: "Sketch",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.adobe.xd",
    name: "Adobe XD",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.invisionapp.studio",
    name: "InVision Studio",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.zeplin.osx",
    name: "Zeplin",
    icon: Icon.Brush,
    category: "design",
  },

  // Productivity
  {
    bundleId: "com.microsoft.Word",
    name: "Microsoft Word",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.microsoft.Excel",
    name: "Microsoft Excel",
    icon: Icon.BarChart,
    category: "productivity",
  },
  {
    bundleId: "com.microsoft.Powerpoint",
    name: "Microsoft PowerPoint",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.apple.iWork.Pages",
    name: "Pages",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.apple.iWork.Numbers",
    name: "Numbers",
    icon: Icon.BarChart,
    category: "productivity",
  },
  {
    bundleId: "com.apple.iWork.Keynote",
    name: "Keynote",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.google.GoogleDocs",
    name: "Google Docs",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.google.GoogleSheets",
    name: "Google Sheets",
    icon: Icon.BarChart,
    category: "productivity",
  },
  {
    bundleId: "com.google.GoogleSlides",
    name: "Google Slides",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.notion.id",
    name: "Notion",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.evernote.Evernote",
    name: "Evernote",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.bear-writer.BearMarkdown",
    name: "Bear",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.uranusjr.macdown",
    name: "MacDown",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "abnerworks.Typora",
    name: "Typora",
    icon: Icon.Document,
    category: "productivity",
  },

  // Media
  {
    bundleId: "com.spotify.client",
    name: "Spotify",
    icon: Icon.Music,
    category: "media",
  },
  {
    bundleId: "com.apple.Music",
    name: "Music",
    icon: Icon.Music,
    category: "media",
  },
  {
    bundleId: "com.apple.TV",
    name: "TV",
    icon: Icon.Video,
    category: "media",
  },
  {
    bundleId: "com.netflix.Netflix",
    name: "Netflix",
    icon: Icon.Video,
    category: "media",
  },
  {
    bundleId: "com.apple.QuickTimePlayerX",
    name: "QuickTime Player",
    icon: Icon.Video,
    category: "media",
  },
  {
    bundleId: "org.videolan.vlc",
    name: "VLC",
    icon: Icon.Video,
    category: "media",
  },
  {
    bundleId: "com.colliderli.iina",
    name: "IINA",
    icon: Icon.Video,
    category: "media",
  },
  {
    bundleId: "com.apple.Photos",
    name: "Photos",
    icon: Icon.Image,
    category: "media",
  },
  {
    bundleId: "com.adobe.lightroom",
    name: "Adobe Lightroom",
    icon: Icon.Image,
    category: "media",
  },

  // System
  {
    bundleId: "com.apple.finder",
    name: "Finder",
    icon: Icon.Folder,
    category: "system",
  },
  {
    bundleId: "com.apple.Terminal",
    name: "Terminal",
    icon: Icon.Terminal,
    category: "system",
  },
  {
    bundleId: "com.googlecode.iterm2",
    name: "iTerm2",
    icon: Icon.Terminal,
    category: "system",
  },
  {
    bundleId: "com.apple.systempreferences",
    name: "System Preferences",
    icon: Icon.Gear,
    category: "system",
  },
  {
    bundleId: "com.apple.ActivityMonitor",
    name: "Activity Monitor",
    icon: Icon.BarChart,
    category: "system",
  },
  {
    bundleId: "com.apple.Console",
    name: "Console",
    icon: Icon.Terminal,
    category: "system",
  },
];

/**
 * Category-based fallback icons for unknown applications
 */
export const CATEGORY_FALLBACK_ICONS: Record<string, Icon> = {
  development: Icon.Code,
  browser: Icon.Globe,
  communication: Icon.Message,
  design: Icon.Brush,
  productivity: Icon.Document,
  media: Icon.Music,
  system: Icon.Gear,
  other: Icon.Desktop,
};
