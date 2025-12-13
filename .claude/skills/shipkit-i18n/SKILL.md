# ShipKit i18n - Internationalization Skill

Manage translations across 7 languages (EN, ES, FR, DE, PT, JA, ZH) following ShipKit Pro conventions. Generate, validate, and sync translation files.

## Capabilities

### Translation Management
- **Generate keys**: Create translation keys for new features
- **Translate content**: Translate UI text to all 7 locales
- **Validate completeness**: Check for missing translations
- **Extract strings**: Find hardcoded strings in code

### Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| en | English | English |
| es | Spanish | Español |
| fr | French | Français |
| de | German | Deutsch |
| pt | Portuguese | Português |
| ja | Japanese | 日本語 |
| zh | Chinese | 中文 |

## Code Standards

```typescript
// 1. Use dot notation for nested keys: "settings.profile.title"
// 2. Use descriptive key names, not abbreviations
// 3. Group related keys under namespaces
// 4. Use interpolation for dynamic values: "Hello, {{name}}"
// 5. Provide context in comments for translators
```

## Usage Examples

### Generate Translations
```
"Add translations for a new settings page with profile and notifications sections"
```

### Translate Marketing Copy
```
"Translate the pricing page hero headline and description to all languages"
```

### Validate Translations
```
"Check which translation keys are missing in the French locale"
```

## File Structure

```
messages/
├── en.json     # English (source)
├── es.json     # Spanish
├── fr.json     # French
├── de.json     # German
├── pt.json     # Portuguese
├── ja.json     # Japanese
└── zh.json     # Chinese
```

## Translation Format

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading..."
  },
  "settings": {
    "title": "Settings",
    "profile": {
      "title": "Profile",
      "description": "Manage your personal information"
    }
  }
}
```

## Scripts Available

| Script | Description |
|--------|-------------|
| `translate.ts` | Translate keys to all locales |
| `extract-strings.ts` | Find hardcoded strings |
| `validate-keys.ts` | Check for missing keys |
| `sync-locales.ts` | Sync missing keys across locales |

## Translation Guidelines

### UI Elements
- Keep buttons short (1-2 words)
- Labels should be clear and consistent
- Error messages should be helpful

### Marketing Copy
- Adapt tone for each culture
- Don't translate brand names
- Keep SEO keywords in mind

### Technical Terms
- Use consistent terminology
- Provide glossary for translators
- Some terms may stay in English

## Integration with ShipKit

Works with next-intl configuration:
1. Messages loaded from `messages/[locale].json`
2. Locale detection via URL or cookie
3. Type-safe translation keys
4. Server and client component support
