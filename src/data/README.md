# Application Icon Configuration

This directory contains JSON configuration files for mapping applications to Raycast icons in the Focus Timer extension.

## Files

### `app-icons.json`
The main configuration file that maps popular applications to their corresponding Raycast library icons.

## Structure

```json
{
  "metadata": {
    "version": "1.0.0",
    "description": "Application to Raycast Icon mappings for the Focus Timer extension",
    "lastUpdated": "2025-01-12",
    "totalMappings": 150
  },
  "defaultIcon": "Desktop",
  "categoryFallbacks": {
    "development": "Code",
    "browser": "Globe",
    // ... more categories
  },
  "applications": {
    "development": {
      "Visual Studio Code": {
        "bundleIds": ["com.microsoft.VSCode", "com.microsoft.VSCodeInsiders"],
        "icon": "Code",
        "aliases": ["VSCode", "VS Code", "Code"]
      }
      // ... more applications
    }
    // ... more categories
  }
}
```

## Categories

The configuration organizes applications into the following categories:

- **development**: IDEs, code editors, development tools
- **browser**: Web browsers
- **communication**: Chat, email, video conferencing
- **design**: Design tools, image editors
- **productivity**: Note-taking, task management, office suites
- **media**: Music, video, audio tools
- **system**: System utilities, file managers
- **gaming**: Games and gaming platforms
- **finance**: Financial and budgeting applications
- **education**: Learning and educational tools
- **other**: Miscellaneous applications

## Icon Mapping

Each application entry includes:

- **bundleIds**: Array of macOS bundle identifiers for the application
- **icon**: Raycast Icon enum value (as string)
- **aliases**: Alternative names the application might be known by

## Available Raycast Icons

The configuration uses Raycast's built-in icon library. Common icons include:

- `Code` - Development tools
- `Globe` - Web browsers
- `Message` - Communication apps
- `Document` - Productivity apps
- `Brush` - Design tools
- `Music` - Media applications
- `Gear` - System utilities
- `Desktop` - Default fallback

## Usage

The JSON configuration is loaded by the `JsonApplicationIconService` which provides:

```typescript
// Get icon for an application
const icon = jsonApplicationIconService.getIconByBundleId("com.microsoft.VSCode");

// Get application mapping with category
const mapping = jsonApplicationIconService.getApplicationMapping(
  "com.microsoft.VSCode", 
  "Visual Studio Code"
);

// Search applications
const results = jsonApplicationIconService.searchApplications("code");
```

## Integration

The JSON service integrates with the existing application tracking system:

1. **Primary Source**: JSON configuration is checked first
2. **Fallback**: Legacy hardcoded service is used if not found in JSON
3. **Default**: `Desktop` icon is used if no mapping exists

## Adding New Applications

To add a new application:

1. Identify the correct category
2. Find the application's bundle ID (use Activity Monitor or `osascript`)
3. Choose an appropriate Raycast icon
4. Add the entry to the JSON file:

```json
"Application Name": {
  "bundleIds": ["com.company.app"],
  "icon": "IconName",
  "aliases": ["App", "Alternative Name"]
}
```

## Maintenance

- Update the `metadata.lastUpdated` field when making changes
- Increment `metadata.totalMappings` when adding new applications
- Test icon mappings in the application tracking interface
- Validate that icon names exist in the Raycast Icon enum

## Benefits

1. **Maintainability**: Easy to add/modify mappings without code changes
2. **Comprehensive**: Supports multiple bundle IDs and aliases per application
3. **Categorized**: Organized structure for better management
4. **Fallbacks**: Multiple levels of fallback for unknown applications
5. **Searchable**: Built-in search functionality
6. **Extensible**: Easy to add new categories and applications

## Performance

The JSON configuration is loaded once at startup and cached in memory for fast lookups. The service maintains separate maps for:

- Bundle ID → Application mapping
- Name → Application mapping  
- Alias → Application mapping

This ensures O(1) lookup performance for icon resolution during application tracking.
