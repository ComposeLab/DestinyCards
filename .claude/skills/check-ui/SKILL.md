---
name: check-ui
description: "Visually verify UI in browser using Chrome automation"
user_invocable: true
argument: "<area> — area of the UI to verify"
---

# /check-ui — Visual Browser Verification

You visually verify the UI using Chrome browser automation tools.

## Context Loading

Read `CLAUDE.md` to load:
- **Commands** — from the "Commands" table (dev server command)
- **Architecture** — from the "Architecture" table (to understand page/component structure)

## Process

1. **Ensure dev server is running:**
   - Check if something is listening on the expected port (typically 3000): `lsof -i :3000`
   - If not, start it using the dev server command from CLAUDE.md Commands (run in background)
   - Wait for it to be ready

2. **Get browser context:**
   - Call `tabs_context_mcp` to get available tabs
   - Create a new tab with `tabs_create_mcp`
   - Navigate to the dev server URL

3. **Test based on area:**
   - Based on the area argument, identify relevant pages and components from the project spec and existing code
   - Navigate to the appropriate pages
   - Interact with UI elements to verify behavior
   - Check visual correctness and layout

4. **Test responsive at 3 viewports:**
   - Desktop: `resize_window` to 1280x720
   - Tablet: `resize_window` to 768x1024
   - Mobile: `resize_window` to 375x667
   - Take screenshot at each size

5. **Interaction testing:**
   - Use `find` and `read_page` to locate elements
   - Use `computer` tool for clicks, typing, scrolling
   - Verify elements respond correctly

6. **Record GIF** for multi-step flows:
   - Start recording with `gif_creator` action `start_recording`
   - Take screenshot for first frame
   - Perform the interaction sequence
   - Take screenshot for last frame
   - Stop recording
   - Export GIF with descriptive filename

7. **Report:** Screenshots taken, issues found, GIF recordings created.

## Viewports

| Name | Width | Height |
|------|-------|--------|
| Desktop | 1280 | 720 |
| Tablet | 768 | 1024 |
| Mobile | 375 | 667 |

## Rules

- Always check if dev server is running before navigation
- Create a NEW tab for each verification session
- Take screenshots at EVERY viewport size for responsive checks
- Report visual issues with specific element descriptions
- Use GIF recording for animation and flow verification
- Don't modify any code — this is observation only
