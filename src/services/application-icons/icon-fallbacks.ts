import { Icon } from "@raycast/api";
import { CATEGORY_FALLBACK_ICONS } from "./icon-mappings";

/**
 * Fallback and category handling for application icons.
 *
 * Handles:
 * - Category-based fallback icons
 * - Intelligent category detection
 * - Default icon selection
 * - Icon validation
 */
export class IconFallbacks {
  private static instance: IconFallbacks;

  private constructor() {}

  public static getInstance(): IconFallbacks {
    if (!IconFallbacks.instance) {
      IconFallbacks.instance = new IconFallbacks();
    }
    return IconFallbacks.instance;
  }

  /**
   * Get category icon for unknown applications
   */
  public getCategoryIcon(name: string): Icon {
    const category = this.detectCategory(name);
    return CATEGORY_FALLBACK_ICONS[category] || Icon.Desktop;
  }

  /**
   * Get fallback icon for a specific category
   */
  public getCategoryFallbackIcon(category: string): Icon {
    return CATEGORY_FALLBACK_ICONS[category] || Icon.Desktop;
  }

  /**
   * Detect application category based on name patterns
   */
  public detectCategory(name: string): string {
    const normalizedName = name.toLowerCase();

    // Development tools
    if (
      this.matchesPatterns(normalizedName, [
        "code",
        "studio",
        "ide",
        "editor",
        "xcode",
        "intellij",
        "webstorm",
        "pycharm",
        "sublime",
        "atom",
        "vim",
        "emacs",
        "nano",
        "git",
        "github",
        "terminal",
        "iterm",
        "console",
        "bash",
        "zsh",
        "powershell",
        "cmd",
        "docker",
        "kubernetes",
        "postman",
        "insomnia",
        "sourcetree",
        "tower",
      ])
    ) {
      return "development";
    }

    // Web browsers
    if (
      this.matchesPatterns(normalizedName, [
        "chrome",
        "firefox",
        "safari",
        "edge",
        "opera",
        "brave",
        "vivaldi",
        "browser",
        "chromium",
        "webkit",
        "tor",
      ])
    ) {
      return "browser";
    }

    // Communication
    if (
      this.matchesPatterns(normalizedName, [
        "slack",
        "teams",
        "zoom",
        "skype",
        "discord",
        "telegram",
        "whatsapp",
        "messenger",
        "signal",
        "mail",
        "outlook",
        "thunderbird",
        "airmail",
        "spark",
        "canary",
        "polymail",
        "mailmate",
        "postbox",
      ])
    ) {
      return "communication";
    }

    // Design tools
    if (
      this.matchesPatterns(normalizedName, [
        "photoshop",
        "illustrator",
        "indesign",
        "aftereffects",
        "premiere",
        "figma",
        "sketch",
        "adobe",
        "creative",
        "design",
        "brush",
        "paint",
        "gimp",
        "inkscape",
        "blender",
        "maya",
        "cinema4d",
        "zeplin",
        "invision",
        "principle",
        "framer",
        "protopie",
      ])
    ) {
      return "design";
    }

    // Productivity
    if (
      this.matchesPatterns(normalizedName, [
        "word",
        "excel",
        "powerpoint",
        "office",
        "pages",
        "numbers",
        "keynote",
        "google docs",
        "google sheets",
        "google slides",
        "notion",
        "evernote",
        "onenote",
        "bear",
        "obsidian",
        "roam",
        "logseq",
        "craft",
        "ulysses",
        "scrivener",
        "markdown",
        "typora",
        "macdown",
        "notes",
        "reminders",
        "calendar",
        "fantastical",
        "things",
        "todoist",
        "omnifocus",
        "taskwarrior",
      ])
    ) {
      return "productivity";
    }

    // Media
    if (
      this.matchesPatterns(normalizedName, [
        "spotify",
        "music",
        "itunes",
        "apple music",
        "youtube",
        "netflix",
        "vlc",
        "quicktime",
        "iina",
        "plex",
        "kodi",
        "photos",
        "lightroom",
        "capture one",
        "final cut",
        "davinci resolve",
        "handbrake",
        "audacity",
        "logic pro",
        "garageband",
        "ableton",
        "pro tools",
      ])
    ) {
      return "media";
    }

    // System utilities
    if (
      this.matchesPatterns(normalizedName, [
        "finder",
        "system preferences",
        "activity monitor",
        "disk utility",
        "keychain",
        "automator",
        "applescript",
        "terminal",
        "console",
        "preferences",
        "settings",
        "control panel",
        "task manager",
        "registry",
        "cleaner",
        "optimizer",
        "monitor",
        "stats",
        "istat",
        "coconutbattery",
      ])
    ) {
      return "system";
    }

    return "other";
  }

  /**
   * Check if name matches any of the given patterns
   */
  private matchesPatterns(name: string, patterns: string[]): boolean {
    return patterns.some(
      (pattern) => name.includes(pattern) || pattern.includes(name)
    );
  }

  /**
   * Get smart fallback icon based on multiple factors
   */
  public getSmartFallback(
    bundleId: string,
    name: string,
    hints?: {
      fileExtensions?: string[];
      processName?: string;
      windowTitle?: string;
    }
  ): Icon {
    // Try bundle ID patterns first
    const bundleCategory = this.detectCategoryFromBundleId(bundleId);
    if (bundleCategory !== "other") {
      return this.getCategoryFallbackIcon(bundleCategory);
    }

    // Try name-based detection
    const nameCategory = this.detectCategory(name);
    if (nameCategory !== "other") {
      return this.getCategoryFallbackIcon(nameCategory);
    }

    // Try hints if provided
    if (hints) {
      const hintCategory = this.detectCategoryFromHints(hints);
      if (hintCategory !== "other") {
        return this.getCategoryFallbackIcon(hintCategory);
      }
    }

    // Final fallback
    return Icon.Desktop;
  }

  /**
   * Detect category from bundle ID patterns
   */
  private detectCategoryFromBundleId(bundleId: string): string {
    const normalizedId = bundleId.toLowerCase();

    if (
      this.matchesPatterns(normalizedId, [
        "com.microsoft.vscode",
        "com.jetbrains",
        "com.apple.dt.xcode",
        "com.github",
        "com.sublimetext",
        "com.panic",
        "com.barebones",
      ])
    ) {
      return "development";
    }

    if (
      this.matchesPatterns(normalizedId, [
        "com.google.chrome",
        "com.apple.safari",
        "org.mozilla.firefox",
        "com.microsoft.edgemac",
        "com.operasoftware",
        "com.brave",
      ])
    ) {
      return "browser";
    }

    if (
      this.matchesPatterns(normalizedId, [
        "com.tinyspeck.slackmacgap",
        "com.microsoft.teams",
        "us.zoom.xos",
        "com.skype",
        "com.discord",
        "com.apple.mail",
        "com.microsoft.outlook",
      ])
    ) {
      return "communication";
    }

    if (
      this.matchesPatterns(normalizedId, [
        "com.adobe",
        "com.figma",
        "com.bohemiancoding.sketch3",
        "com.invisionapp",
        "com.zeplin",
      ])
    ) {
      return "design";
    }

    if (
      this.matchesPatterns(normalizedId, [
        "com.microsoft.word",
        "com.microsoft.excel",
        "com.microsoft.powerpoint",
        "com.apple.iwork",
        "com.google",
        "com.notion",
        "com.evernote",
      ])
    ) {
      return "productivity";
    }

    if (
      this.matchesPatterns(normalizedId, [
        "com.spotify",
        "com.apple.music",
        "com.apple.tv",
        "com.netflix",
        "org.videolan.vlc",
        "com.apple.photos",
      ])
    ) {
      return "media";
    }

    if (
      this.matchesPatterns(normalizedId, [
        "com.apple.finder",
        "com.apple.terminal",
        "com.apple.systempreferences",
        "com.apple.activitymonitor",
      ])
    ) {
      return "system";
    }

    return "other";
  }

  /**
   * Detect category from additional hints
   */
  private detectCategoryFromHints(hints: {
    fileExtensions?: string[];
    processName?: string;
    windowTitle?: string;
  }): string {
    // Check file extensions
    if (hints.fileExtensions) {
      const extensions = hints.fileExtensions.map((ext) => ext.toLowerCase());

      if (
        extensions.some((ext) =>
          [
            ".js",
            ".ts",
            ".py",
            ".java",
            ".cpp",
            ".c",
            ".h",
            ".swift",
            ".go",
            ".rs",
            ".php",
            ".rb",
            ".cs",
            ".html",
            ".css",
            ".scss",
            ".json",
            ".xml",
            ".yaml",
            ".yml",
            ".sql",
            ".sh",
            ".bat",
          ].includes(ext)
        )
      ) {
        return "development";
      }

      if (
        extensions.some((ext) =>
          [
            ".psd",
            ".ai",
            ".sketch",
            ".fig",
            ".xd",
            ".png",
            ".jpg",
            ".jpeg",
            ".gif",
            ".svg",
            ".ico",
            ".tiff",
            ".bmp",
            ".webp",
          ].includes(ext)
        )
      ) {
        return "design";
      }

      if (
        extensions.some((ext) =>
          [
            ".mp4",
            ".mov",
            ".avi",
            ".mkv",
            ".mp3",
            ".wav",
            ".flac",
            ".aac",
            ".m4a",
            ".ogg",
            ".wma",
          ].includes(ext)
        )
      ) {
        return "media";
      }

      if (
        extensions.some((ext) =>
          [
            ".doc",
            ".docx",
            ".pdf",
            ".txt",
            ".rtf",
            ".pages",
            ".xls",
            ".xlsx",
            ".numbers",
            ".ppt",
            ".pptx",
            ".key",
            ".md",
            ".tex",
          ].includes(ext)
        )
      ) {
        return "productivity";
      }
    }

    // Check process name
    if (hints.processName) {
      const processCategory = this.detectCategory(hints.processName);
      if (processCategory !== "other") {
        return processCategory;
      }
    }

    // Check window title
    if (hints.windowTitle) {
      const titleCategory = this.detectCategory(hints.windowTitle);
      if (titleCategory !== "other") {
        return titleCategory;
      }
    }

    return "other";
  }

  /**
   * Validate that an icon is appropriate for a category
   */
  public validateIconForCategory(icon: Icon, category: string): boolean {
    const expectedIcon = this.getCategoryFallbackIcon(category);

    // Allow the expected icon and some common alternatives
    const validIcons: Record<string, Icon[]> = {
      development: [Icon.Code, Icon.Terminal, Icon.Hammer, Icon.Gear],
      browser: [Icon.Globe, Icon.Link, Icon.Window],
      communication: [Icon.Message, Icon.Envelope, Icon.Video, Icon.Phone],
      design: [Icon.Brush, Icon.Image, Icon.Pencil, Icon.Wand],
      productivity: [Icon.Document, Icon.Text, Icon.List, Icon.Calendar],
      media: [Icon.Music, Icon.Video, Icon.Image, Icon.Play],
      system: [Icon.Gear, Icon.Cog, Icon.Monitor, Icon.Desktop],
      other: [Icon.Desktop, Icon.AppWindow, Icon.Folder],
    };

    return validIcons[category]?.includes(icon) || icon === expectedIcon;
  }

  /**
   * Get all available categories
   */
  public getAllCategories(): string[] {
    return Object.keys(CATEGORY_FALLBACK_ICONS);
  }

  /**
   * Get category statistics
   */
  public getCategoryStatistics(): Record<
    string,
    { icon: Icon; description: string }
  > {
    return {
      development: {
        icon: CATEGORY_FALLBACK_ICONS.development,
        description: "Code editors, IDEs, development tools",
      },
      browser: {
        icon: CATEGORY_FALLBACK_ICONS.browser,
        description: "Web browsers and internet applications",
      },
      communication: {
        icon: CATEGORY_FALLBACK_ICONS.communication,
        description: "Chat, email, video conferencing apps",
      },
      design: {
        icon: CATEGORY_FALLBACK_ICONS.design,
        description: "Design tools, image editors, creative apps",
      },
      productivity: {
        icon: CATEGORY_FALLBACK_ICONS.productivity,
        description: "Office apps, note-taking, task management",
      },
      media: {
        icon: CATEGORY_FALLBACK_ICONS.media,
        description: "Music, video, photo applications",
      },
      system: {
        icon: CATEGORY_FALLBACK_ICONS.system,
        description: "System utilities and preferences",
      },
      other: {
        icon: CATEGORY_FALLBACK_ICONS.other,
        description: "Uncategorized applications",
      },
    };
  }
}

export const iconFallbacks = IconFallbacks.getInstance();
