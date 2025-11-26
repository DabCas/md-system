# MCP Server Configuration Guide

This project is configured with two MCP (Model Context Protocol) servers to enhance Claude Code's capabilities:

1. **Supabase MCP** - Direct database management and queries
2. **Chrome DevTools MCP** - Browser automation and testing

## Setup Instructions

### 1. Configure Supabase MCP

#### Step 1: Get Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project if you haven't already (or use an existing one)

**Get Project Reference ID:**
- In your project dashboard, click **Settings** (gear icon in sidebar)
- Go to **General** tab
- Copy the **Reference ID** (format: `abcdefghijklmnop`)

**Get Access Token:**
- Click your **profile icon** (top right)
- Go to **Account Settings**
- Navigate to **Access Tokens** tab
- Click **Generate New Token**
- Give it a name like "Claude Code MCP"
- Copy the token (starts with `sbp_...`)

#### Step 2: Create Environment File

```bash
# Copy the example file
cp .env.example .env
```

Then edit `.env` and paste your credentials:

```env
SUPABASE_PROJECT_REF=your-actual-project-ref
SUPABASE_ACCESS_TOKEN=sbp_your-actual-token
```

### 2. Chrome DevTools MCP Setup

Chrome DevTools MCP is already configured and will work automatically. It uses `npx` to run the latest version.

**No additional setup required!** It will:
- Auto-install when first used
- Launch a Chrome instance for automation
- Provide tools for screenshot, navigation, console logs, etc.

### 3. Restart Claude Code

After setting up your `.env` file:

1. Close this Claude Code session
2. Reopen the project
3. The MCP servers will be loaded automatically

You can verify by checking for available MCP tools starting with `mcp__supabase__` and `mcp__chrome-devtools__`.

## Available MCP Tools

### Supabase MCP Tools
Once configured, you'll have access to:
- `mcp__supabase__query` - Execute SQL queries
- `mcp__supabase__list_tables` - List all tables
- `mcp__supabase__describe_table` - Get table schema
- `mcp__supabase__create_table` - Create new tables
- `mcp__supabase__insert_data` - Insert records
- And more...

### Chrome DevTools MCP Tools
- `mcp__chrome-devtools__navigate` - Navigate to URL
- `mcp__chrome-devtools__screenshot` - Capture screenshots
- `mcp__chrome-devtools__console_logs` - Get console logs
- `mcp__chrome-devtools__execute_javascript` - Run JS in page
- `mcp__chrome-devtools__click` - Click elements
- And more...

## Security Best Practices

### Supabase
- **Use a development project**, not production
- Consider enabling **read-only mode** if connecting to real data
- Never commit `.env` file to version control (already in `.gitignore`)
- Rotate access tokens periodically

### Chrome DevTools
- Runs in isolated browser instance by default
- No special security configuration needed for development

## Troubleshooting

### Supabase MCP Not Working?
1. Check `.env` file exists and has correct values
2. Verify `SUPABASE_PROJECT_REF` format (no spaces, correct ID)
3. Confirm `SUPABASE_ACCESS_TOKEN` starts with `sbp_`
4. Ensure token has not expired

### Chrome DevTools MCP Not Working?
1. Check if Node.js is installed: `node --version`
2. Check if npx is available: `npx --version`
3. Clear npm cache: `npm cache clean --force`
4. Manually install: `npm install -g chrome-devtools-mcp`

## Configuration Files

- `.mcp.json` - MCP server configuration (safe to commit)
- `.env.example` - Template for environment variables (safe to commit)
- `.env` - Your actual credentials (NEVER commit - in `.gitignore`)

## Additional Resources

- [Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Claude Code MCP Guide](https://docs.claude.com/en/docs/claude-code/mcp)
