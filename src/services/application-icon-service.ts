import { Icon } from "@raycast/api";

/**
 * Service for mapping application bundle IDs and names to appropriate Raycast native icons.
 *
 * This service provides a comprehensive mapping of popular applications to their
 * corresponding Raycast icons, with intelligent fallback mechanisms for unknown applications.
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
const APPLICATION_ICON_MAPPINGS: ApplicationIconMapping[] = [
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
    bundleId: "com.sublimetext.4",
    name: "Sublime Text",
    icon: Icon.Document,
    category: "development",
  },
  {
    bundleId: "com.github.atom",
    name: "Atom",
    icon: Icon.Code,
    category: "development",
  },
  {
    bundleId: "com.vim.MacVim",
    name: "MacVim",
    icon: Icon.Terminal,
    category: "development",
  },
  {
    bundleId: "com.apple.Terminal",
    name: "Terminal",
    icon: Icon.Terminal,
    category: "development",
  },
  {
    bundleId: "com.googlecode.iterm2",
    name: "iTerm2",
    icon: Icon.Terminal,
    category: "development",
  },
  {
    bundleId: "com.github.GitHubDesktop",
    name: "GitHub Desktop",
    icon: Icon.TwoArrowsClockwise,
    category: "development",
  },
  {
    bundleId: "com.sourcetreeapp.Sourcetree",
    name: "Sourcetree",
    icon: Icon.Tree,
    category: "development",
  },

  // Browsers
  {
    bundleId: "com.google.Chrome",
    name: "Google Chrome",
    icon: Icon.Globe,
    category: "browser",
  },
  {
    bundleId: "com.mozilla.firefox",
    name: "Firefox",
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
    icon: Icon.Shield,
    category: "browser",
  },
  {
    bundleId: "org.chromium.Chromium",
    name: "Chromium",
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
    icon: Icon.Video,
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
    bundleId: "com.telegram.desktop",
    name: "Telegram",
    icon: Icon.Message,
    category: "communication",
  },
  {
    bundleId: "com.whatsapp.WhatsApp",
    name: "WhatsApp",
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

  // Design Tools
  {
    bundleId: "com.figma.Desktop",
    name: "Figma",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.adobe.photoshop",
    name: "Adobe Photoshop",
    icon: Icon.Image,
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
    name: "After Effects",
    icon: Icon.Video,
    category: "design",
  },
  {
    bundleId: "com.adobe.Premiere Pro",
    name: "Premiere Pro",
    icon: Icon.Video,
    category: "design",
  },
  {
    bundleId: "com.bohemiancoding.sketch3",
    name: "Sketch",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.framerx.Framer",
    name: "Framer",
    icon: Icon.Brush,
    category: "design",
  },
  {
    bundleId: "com.invisionapp.studio",
    name: "InVision Studio",
    icon: Icon.Brush,
    category: "design",
  },

  // Productivity
  {
    bundleId: "com.notion.id",
    name: "Notion",
    icon: Icon.Document,
    category: "productivity",
  },
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
    bundleId: "com.evernote.Evernote",
    name: "Evernote",
    icon: Icon.Document,
    category: "productivity",
  },
  {
    bundleId: "com.culturedcode.ThingsMac",
    name: "Things 3",
    icon: Icon.CheckList,
    category: "productivity",
  },
  {
    bundleId: "com.omnigroup.OmniFocus3",
    name: "OmniFocus 3",
    icon: Icon.CheckList,
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
    name: "Apple Music",
    icon: Icon.Music,
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
    bundleId: "com.apple.Photos",
    name: "Photos",
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
const CATEGORY_FALLBACK_ICONS: Record<string, Icon> = {
  development: Icon.Code,
  browser: Icon.Globe,
  communication: Icon.Message,
  design: Icon.Brush,
  productivity: Icon.Document,
  media: Icon.Music,
  system: Icon.Gear,
  other: Icon.Desktop,
};

/**
 * Application Icon Service
 */
export class ApplicationIconService {
  private static instance: ApplicationIconService;
  private iconMappings: Map<string, ApplicationIconMapping>;
  private nameMappings: Map<string, ApplicationIconMapping>;

  private constructor() {
    this.iconMappings = new Map();
    this.nameMappings = new Map();
    this.initializeMappings();
  }

  public static getInstance(): ApplicationIconService {
    if (!ApplicationIconService.instance) {
      ApplicationIconService.instance = new ApplicationIconService();
    }
    return ApplicationIconService.instance;
  }

  private initializeMappings(): void {
    APPLICATION_ICON_MAPPINGS.forEach((mapping) => {
      this.iconMappings.set(mapping.bundleId.toLowerCase(), mapping);
      this.nameMappings.set(mapping.name.toLowerCase(), mapping);
    });
  }

  /**
   * Get icon for application by bundle ID
   */
  public getIconByBundleId(bundleId: string): Icon {
    const mapping = this.iconMappings.get(bundleId.toLowerCase());
    return mapping?.icon || Icon.Desktop;
  }

  /**
   * Get icon for application by name with intelligent matching
   */
  public getIconByName(name: string): Icon {
    const normalizedName = name.toLowerCase();

    // Exact match
    const exactMapping = this.nameMappings.get(normalizedName);
    if (exactMapping) {
      return exactMapping.icon;
    }

    // Partial match
    for (const [mappedName, mapping] of this.nameMappings.entries()) {
      if (
        normalizedName.includes(mappedName) ||
        mappedName.includes(normalizedName)
      ) {
        return mapping.icon;
      }
    }

    // Category-based fallback
    return this.getCategoryIcon(name);
  }

  /**
   * Get category-based icon for unknown applications
   */
  private getCategoryIcon(name: string): Icon {
    const normalizedName = name.toLowerCase();

    // Development tools
    if (
      normalizedName.includes("code") ||
      normalizedName.includes("ide") ||
      normalizedName.includes("editor") ||
      normalizedName.includes("terminal")
    ) {
      return CATEGORY_FALLBACK_ICONS.development;
    }

    // Browsers
    if (
      normalizedName.includes("browser") ||
      normalizedName.includes("chrome") ||
      normalizedName.includes("firefox") ||
      normalizedName.includes("safari")
    ) {
      return CATEGORY_FALLBACK_ICONS.browser;
    }

    // Communication
    if (
      normalizedName.includes("chat") ||
      normalizedName.includes("message") ||
      normalizedName.includes("mail") ||
      normalizedName.includes("video")
    ) {
      return CATEGORY_FALLBACK_ICONS.communication;
    }

    // Design
    if (
      normalizedName.includes("design") ||
      normalizedName.includes("photo") ||
      normalizedName.includes("image") ||
      normalizedName.includes("graphics")
    ) {
      return CATEGORY_FALLBACK_ICONS.design;
    }

    // Media
    if (
      normalizedName.includes("music") ||
      normalizedName.includes("video") ||
      normalizedName.includes("player") ||
      normalizedName.includes("media")
    ) {
      return CATEGORY_FALLBACK_ICONS.media;
    }

    return CATEGORY_FALLBACK_ICONS.other;
  }

  /**
   * Get application mapping information
   */
  public getApplicationMapping(
    bundleId: string,
    name: string,
  ): ApplicationIconMapping | null {
    return (
      this.iconMappings.get(bundleId.toLowerCase()) ||
      this.nameMappings.get(name.toLowerCase()) ||
      null
    );
  }

  /**
   * Check if application is recognized
   */
  public isRecognizedApplication(bundleId: string, name: string): boolean {
    return (
      this.iconMappings.has(bundleId.toLowerCase()) ||
      this.nameMappings.has(name.toLowerCase())
    );
  }
}

// Export singleton instance
export const applicationIconService = ApplicationIconService.getInstance();
