# Release Process

This document outlines the automated release workflow using changelogen for the mrx-nuxt-template project.

## Prerequisites

- Ensure you're on the `main` branch
- Ensure your working directory is clean (`git status` shows no uncommitted changes)
- Ensure you have the latest changes (`git pull origin main`)

## Available Release Commands

All release commands use changelogen with automated version bumping, changelog generation, git commits, and tagging.

### Preview Changelog (No Release)
```bash
pnpm changelog
```
- Generates changelog preview without making any changes
- Useful for reviewing what will be included in the next release

### Automated Releases

#### Patch Release (Bug fixes)
```bash
pnpm release:patch
```
- Increments version: `1.0.0` → `1.0.1`
- Use for: Bug fixes, small improvements, documentation updates

#### Minor Release (New features)
```bash
pnpm release:minor
```
- Increments version: `1.0.0` → `1.1.0`
- Use for: New features, enhancements, backwards-compatible changes

#### Major Release (Breaking changes)
```bash
pnpm release:major
```
- Increments version: `1.0.0` → `2.0.0`
- Use for: Breaking changes, major refactors, API changes

#### General Release (Auto-detect)
```bash
pnpm release
```
- Automatically determines version increment based on conventional commits
- Analyzes commit messages since last release

## What Happens During a Release

1. **Version Bump**: Updates `version` field in `package.json`
2. **Changelog Update**: Updates `CHANGELOG.md` with new commits since last release
3. **Git Commit**: Creates a commit with message `chore(release): vX.X.X`
4. **Git Tag**: Creates a git tag `vX.X.X` pointing to the release commit
5. **GitHub Integration**: Opens browser to create GitHub release (optional)

## Conventional Commits

Our changelog automatically categorizes commits based on conventional commit format:

- `feat:` → 🚀 **Enhancements**
- `fix:` → 🩹 **Fixes**  
- `refactor:` → 💅 **Refactors**
- `docs:` → 📖 **Documentation**
- `chore:` → ⚙️ **Chores**

### Examples:
```bash
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login validation issue"
git commit -m "refactor: improve database connection handling"
```

## Workflow Example

```bash
# 1. Make your changes and commit with conventional format
git add .
git commit -m "feat: add dark mode toggle"

# 2. Preview the changelog
pnpm changelog

# 3. Create a minor release (for new features)
pnpm release:minor

# 4. Push to remote (if desired)
git push origin main --tags
```

## GitHub Releases

After running a release command, changelogen will open your browser to GitHub's "Create Release" page. You can:

- **Create the release** on GitHub to make it publicly visible
- **Close the tab** if you only want local versioning

## Troubleshooting

### "No changes found"
- This happens when there are no commits since the last release
- Ensure you have new commits to release

### "Working directory not clean"
- Commit or stash your changes before running release commands
- Check `git status` to see uncommitted files

### Browser doesn't open
- This is normal behavior, GitHub integration is optional
- The local release (version, changelog, commit, tag) still works

## Team Guidelines

1. **Always use conventional commits** for proper changelog categorization
2. **Test your changes** before creating releases
3. **Use appropriate release type**: patch for fixes, minor for features, major for breaking changes
4. **Review the changelog preview** before finalizing releases
5. **Coordinate major releases** with the team

## Configuration

The release scripts are configured in `package.json`:
- All scripts include `--hideAuthorEmail` for clean contributor display
- Changelog automatically links to GitHub commits and compare views
- Release commits follow conventional format: `chore(release): vX.X.X`