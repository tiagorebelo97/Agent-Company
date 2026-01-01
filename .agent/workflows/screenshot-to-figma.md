---
description: Reconstruct Figma designs from screenshots with pixel-perfect accuracy
---

# Screenshot to Figma Reconstruction Workflow

This workflow guides you through reconstructing Figma designs from screenshots with pixel-perfect accuracy.

## Icon Priority Hierarchy (CRITICAL)

**Always follow this order when adding icons:**

### 1. FIRST: Community Components (Preferred)
Use professional icon libraries from Figma community:
- **Feather Icons** - Clean, minimal outline icons
- **Heroicons** - Beautiful hand-crafted SVG icons  
- **Material Icons** - Google's Material Design icons
- **Lucide** - Extended Feather Icons set

**Steps:**
1. Enable icon library in Figma (Assets → Libraries)
2. Use `get_local_components` to list available icons
3. Use `create_component_instance` to place icons

### 2. SECOND: AI-Generated Icons
If community components aren't available or don't match:
- Use `generate_image` to create custom icons
- Convert to base64 and import with `import_image`
- Ensures perfect match to design

### 3. THIRD: Geometric Icons (Fallback Only)
Use geometric shapes only as last resort:
- When no internet/community access
- For rapid prototyping
- Temporary placeholders

**Example Decision Tree:**
```
Need icon → Check community libraries → Found? → Use component
                                      → Not found? → Generate with AI → Import
                                                                      → Failed? → Use geometric
```

## Prerequisites

1. Figma plugin installed and running
2. WebSocket server running (`node socket-node.js`)
3. Screenshots available in a known directory
4. Channel ID from Figma plugin (check `config/agents.yaml`)

## Step 1: Setup and Verification

// turbo
1. Verify Figma plugin is connected:
```bash
curl -s http://localhost:3055/status
```

2. Check channel ID in Figma plugin UI (top right corner)

3. Update channel ID in config if needed:
```bash
# Edit config/agents.yaml and update the channel ID under figma_designer.config.channel
```

## Step 2: Analyze Screenshot (CRITICAL - DO THIS THOROUGHLY)

### Visual Inventory - Document EVERY element:

1. **Layout Structure:**
   - Sidebar (width, background color)
   - Header (height, elements)
   - Content areas (positioning, spacing)
   - Footer (if present)

2. **Color Scheme:**
   - Background colors (main, sidebar, cards)
   - Text colors (primary, secondary, muted, labels)
   - Accent colors (cyan, green, blue, etc.)
   - Border colors and opacity

3. **Typography:**
   - Font sizes (headings, body, labels, captions)
   - Font weights (700 for headings, 600 for labels, 400 for body)
   - Text colors for different hierarchy levels

4. **Components:**
   - Buttons (size, colors, corner radius)
   - Cards (dimensions, padding, border radius)
   - Tables (column widths, row heights, spacing)
   - Forms (input fields, labels, spacing)

5. **Icons (IMPORTANT):**
   - Type: Outline vs Filled
   - Size: Usually 16px for nav, 24px for stat cards
   - Color: Match active/inactive states
   - Style: Geometric shapes using rectangles and circles
   - **Note:** Create icons using geometric shapes (rectangles, circles) NOT emojis

6. **Images/Avatars:**
   - Circular avatars with initials
   - Logo placeholders
   - Dimensions and border radius

7. **Visual Effects:**
   - Card shadows (usually none in dark themes)
   - Borders (subtle, low opacity)
   - Corner radius (8px for buttons, 12px for cards, 6px for inputs)

### Extract Design Tokens

Create a tokens dictionary with ALL colors:

```python
TOKENS = {
    # Backgrounds
    "bg_space": "#0a0e1a",        # Main background
    "bg_dark": "#0f1419",          # Darker variant
    "sidebar_bg": "#0f1419",       # Sidebar background
    
    # Cards
    "card_glass": "#1a1f2e",       # Card background
    "card_border": "rgba(255, 255, 255, 0.08)",  # Card border
    "card_hover": "#1f2937",       # Hover state
    
    # Text
    "text_white": "#f8fafc",       # Primary text
    "text_subtitle": "#94a3b8",    # Subtitles
    "text_label": "#cbd5e1",       # Labels
    "text_muted": "#64748b",       # Secondary text
    
    # Accents
    "logo_cyan": "#22d3ee",        # Primary accent
    "accent_green": "#10b981",     # Success/active
    "accent_blue": "#3b82f6",      # Info
    "accent_purple": "#8b5cf6",    # Special
    "accent_orange": "#f59e0b",    # Warning
    "accent_red": "#ef4444",       # Error
    
    # Navigation
    "nav_item": "#64748b",         # Inactive nav
    "nav_active": "#22d3ee",       # Active nav
    
    # Input
    "input_bg": "#1a202c",         # Input background
    "input_border": "rgba(148, 163, 184, 0.3)",  # Input border
    "input_text": "#e2e8f0",       # Input text
}
```

## Step 3: Use Component Library

Import and use the reusable component library:

```python
from shared.figma_components import FigmaComponentLibrary, parse_rgba, DESIGN_TOKENS

# Initialize
agent = FigmaDesignerAgent()
lib = FigmaComponentLibrary(agent)

# Create main frame
res = agent.execute({"action": "create_frame", "parameters": {
    "name": "Screen Name", "width": 1440, "height": 1024, "x": 0, "y": 0,
    "fillColor": parse_rgba(DESIGN_TOKENS["bg_space"])
}})
f_id = res.get("result", {}).get("id")
```

## Step 4: Build Layout Components

### Sidebar with Navigation

```python
# Create sidebar (returns width)
sidebar_w = lib.create_sidebar(f_id, width=140)

# Add navigation items with geometric icons
nav_items = ["Dashboard", "Countries", "Clubs", "Venues", "Competitions", "Seasons", "Settings", "Users"]
lib.add_nav_items(f_id, nav_items, active_item="Dashboard")

# Add logout at bottom
lib.create_text(f_id, 16, 980, "Logout", size=13, weight=500, 
               color=DESIGN_TOKENS["text_muted"])
```

### Page Header

```python
content_x = sidebar_w + 60  # Content starts after sidebar

# Top bar
lib.create_top_bar(f_id, content_x, 20, "Platform Control Center")

# Page header with title and subtitle
lib.create_page_header(f_id, content_x, 70, "Page Title",
                      "Subtitle text goes here")
```

### Stat Cards

**IMPORTANT: Follow icon priority hierarchy!**

```python
from shared.figma_components import FigmaComponentLibrary
import base64

# Initialize
agent = FigmaDesignerAgent()
lib = FigmaComponentLibrary(agent)

# Icon data for stat cards
stat_cards = [
    {"label": "TOTAL CLUBS", "value": "2", "subtitle": "2 Active", 
     "icon_name": "building", "icon_search": ["building", "office", "company"]},
    {"label": "TOTAL USERS", "value": "2", "subtitle": "Registered", 
     "icon_name": "users", "icon_search": ["users", "people", "group"]},
    {"label": "VENUES MANAGED", "value": "0", "subtitle": "Active stadiums", 
     "icon_name": "location", "icon_search": ["map-pin", "location", "marker"]},
]

card_y = 150
card_width = 240
card_spacing = 24

for i, card in enumerate(stat_cards):
    x = content_x + i * (card_width + card_spacing)
    
    # Card background
    lib.create_rectangle(f_id, x, card_y, card_width, 140, f"Stat: {card['label']}",
                        fill_color=DESIGN_TOKENS["card_glass"], corner_radius=12,
                        stroke_color=DESIGN_TOKENS["card_border"], stroke_weight=1)
    
    # ICON PRIORITY HIERARCHY
    icon_x, icon_y = x + 20, card_y + 20
    icon_placed = False
    
    # 1. TRY COMMUNITY COMPONENTS FIRST
    try:
        components = agent.execute({"action": "get_local_components", "parameters": {}})
        components_list = components.get("result", [])
        
        # Search for matching icon
        for search_term in card["icon_search"]:
            for comp in components_list:
                if search_term.lower() in comp.get("name", "").lower():
                    # Found! Use this component
                    agent.execute({"action": "create_component_instance", "parameters": {
                        "componentKey": comp["key"],
                        "x": icon_x,
                        "y": icon_y,
                        "parentId": f_id
                    }})
                    icon_placed = True
                    print(f"✅ Used community icon: {comp['name']}")
                    break
            if icon_placed:
                break
    except Exception as e:
        print(f"⚠️ Community components not available: {e}")
    
    # 2. TRY AI-GENERATED ICON IF NOT FOUND
    if not icon_placed:
        try:
            from generate_image import generate_image
            
            # Generate icon
            icon_file = generate_image(
                prompt=f"Minimalist outline icon of {card['icon_name']}, cyan color #22d3ee, 24x24px, transparent background, simple line art",
                image_name=f"icon_{card['icon_name']}"
            )
            
            # Convert to base64
            with open(icon_file, "rb") as f:
                icon_data = base64.b64encode(f.read()).decode()
            
            # Import to Figma
            agent.execute({"action": "import_image", "parameters": {
                "x": icon_x,
                "y": icon_y,
                "width": 24,
                "height": 24,
                "imageData": f"data:image/png;base64,{icon_data}",
                "name": f"Icon: {card['icon_name']}",
                "parentId": f_id
            }})
            icon_placed = True
            print(f"✅ Used AI-generated icon: {card['icon_name']}")
        except Exception as e:
            print(f"⚠️ AI icon generation failed: {e}")
    
    # 3. FALLBACK TO GEOMETRIC ICON
    if not icon_placed:
        if card["icon_name"] == "building":
            lib.create_building_icon(f_id, icon_x, icon_y, size=24)
        elif card["icon_name"] == "users":
            lib.create_users_icon(f_id, icon_x, icon_y, size=24)
        elif card["icon_name"] == "location":
            lib.create_location_icon(f_id, icon_x, icon_y, size=24)
        print(f"⚠️ Using geometric fallback for: {card['icon_name']}")
    
    # Labels and values
    lib.create_text(f_id, x+20, card_y+55, card["label"], size=10, weight=600,
                   color=DESIGN_TOKENS["text_muted"])
    lib.create_text(f_id, x+20, card_y+75, card["value"], size=36, weight=700)
    lib.create_text(f_id, x+20, card_y+115, card["subtitle"], size=11, weight=400,
                   color=DESIGN_TOKENS["accent_green"])
```

### Helper Function for Icon Priority

Create a reusable function:

```python
def place_icon_with_priority(agent, lib, parent_id, x, y, icon_name, search_terms, size=24):
    """
    Place icon following priority hierarchy:
    1. Community components
    2. AI-generated
    3. Geometric fallback
    
    Args:
        agent: FigmaDesignerAgent instance
        lib: FigmaComponentLibrary instance
        parent_id: Parent frame ID
        x, y: Position
        icon_name: Icon identifier (e.g., 'building', 'users')
        search_terms: List of search terms for community components
        size: Icon size in pixels
    
    Returns:
        str: Method used ('community', 'ai', 'geometric')
    """
    
    # 1. TRY COMMUNITY COMPONENTS
    try:
        components = agent.execute({"action": "get_local_components", "parameters": {}})
        components_list = components.get("result", [])
        
        for search_term in search_terms:
            for comp in components_list:
                if search_term.lower() in comp.get("name", "").lower():
                    agent.execute({"action": "create_component_instance", "parameters": {
                        "componentKey": comp["key"],
                        "x": x, "y": y,
                        "parentId": parent_id
                    }})
                    return 'community'
    except:
        pass
    
    # 2. TRY AI-GENERATED
    try:
        from generate_image import generate_image
        import base64
        
        icon_file = generate_image(
            prompt=f"Minimalist outline icon of {icon_name}, cyan #22d3ee, {size}x{size}px, transparent, line art",
            image_name=f"icon_{icon_name}"
        )
        
        with open(icon_file, "rb") as f:
            icon_data = base64.b64encode(f.read()).decode()
        
        agent.execute({"action": "import_image", "parameters": {
            "x": x, "y": y, "width": size, "height": size,
            "imageData": f"data:image/png;base64,{icon_data}",
            "name": f"Icon: {icon_name}",
            "parentId": parent_id
        }})
        return 'ai'
    except:
        pass
    
    # 3. GEOMETRIC FALLBACK
    icon_methods = {
        'building': lib.create_building_icon,
        'users': lib.create_users_icon,
        'location': lib.create_location_icon,
        'chart': lib.create_chart_icon,
        'dashboard': lib.create_dashboard_icon,
        'countries': lib.create_countries_icon,
        'clubs': lib.create_clubs_icon,
        'venues': lib.create_venues_icon,
        'competitions': lib.create_competitions_icon,
        'seasons': lib.create_seasons_icon,
        'settings': lib.create_settings_icon,
    }
    
    if icon_name in icon_methods:
        icon_methods[icon_name](parent_id, x, y, size=size)
        return 'geometric'
    
    return 'none'

# Usage:
method = place_icon_with_priority(
    agent, lib, f_id, icon_x, icon_y,
    icon_name="building",
    search_terms=["building", "office", "company"],
    size=24
)
print(f"Icon placed using: {method}")
```

### Stat Cards (Simplified with Helper)

```python
stat_cards = [
    {"label": "TOTAL CLUBS", "value": "2", "subtitle": "2 Active", "icon_type": "building"},
    {"label": "TOTAL USERS", "value": "2", "subtitle": "Registered", "icon_type": "users"},
]

card_y = 150
card_width = 240
card_spacing = 24

for i, card in enumerate(stat_cards):
    x = content_x + i * (card_width + card_spacing)
    
    # Card background
    lib.create_rectangle(f_id, x, card_y, card_width, 140, f"Stat: {card['label']}",
                        fill_color=DESIGN_TOKENS["card_glass"], corner_radius=12,
                        stroke_color=DESIGN_TOKENS["card_border"], stroke_weight=1)
    
    # Icon (geometric)
    icon_x, icon_y = x + 20, card_y + 20
    if card["icon_type"] == "building":
        lib.create_building_icon(f_id, icon_x, icon_y, size=24)
    elif card["icon_type"] == "users":
        lib.create_users_icon(f_id, icon_x, icon_y, size=24)
    elif card["icon_type"] == "location":
        lib.create_location_icon(f_id, icon_x, icon_y, size=24)
    
    # Label, value, subtitle
    lib.create_text(f_id, x+20, card_y+55, card["label"], size=10, weight=600,
                   color=DESIGN_TOKENS["text_muted"])
    lib.create_text(f_id, x+20, card_y+75, card["value"], size=36, weight=700)
    lib.create_text(f_id, x+20, card_y+115, card["subtitle"], size=11, weight=400,
                   color=DESIGN_TOKENS["accent_green"])
```

### Tables with Avatars

```python
# Table data
rows = [
    {"name": "Fofo Club", "initials": "FC", "location": "Unknown", "date": "12/30/2025"},
    {"name": "Sporting CP", "initials": "SC", "location": "Portugal", "date": "12/30/2025"}
]

# Create table container
table_y = 500
lib.create_rectangle(f_id, content_x, table_y, 1040, 240, "Table",
                    fill_color=DESIGN_TOKENS["card_glass"], corner_radius=12,
                    stroke_color=DESIGN_TOKENS["card_border"], stroke_weight=1)

# Title and headers
lib.create_text(f_id, content_x+24, table_y+24, "Table Title", size=16, weight=600)
headers = ["CLUB NAME", "LOCATION", "JOINED DATE", "ACTION"]
for i, header in enumerate(headers):
    lib.create_text(f_id, content_x+70 + i*300, table_y+70, header, size=10, weight=600,
                   color=DESIGN_TOKENS["text_label"])

# Rows with avatars
for i, row in enumerate(rows):
    row_y = table_y + 110 + i * 50
    
    # Avatar
    lib.create_avatar(f_id, content_x+24, row_y-4, size=32, initials=row["initials"])
    
    # Data
    lib.create_text(f_id, content_x+70, row_y, row["name"], size=13, weight=500)
    lib.create_text(f_id, content_x+370, row_y, row["location"], size=13, weight=400,
                   color=DESIGN_TOKENS["text_muted"])
    lib.create_text(f_id, content_x+670, row_y, row["date"], size=13, weight=400,
                   color=DESIGN_TOKENS["text_muted"])
    
    # Menu dots
    lib.create_menu_dots(f_id, content_x+880, row_y+4)
```

## Step 5: Available Geometric Icons

The library includes these geometric outline-style icons:

### Navigation Icons (16x16px)
- `create_dashboard_icon()` - Grid of 4 squares
- `create_countries_icon()` - Globe with meridian/equator
- `create_clubs_icon()` - Shield shape
- `create_venues_icon()` - Stadium outline
- `create_competitions_icon()` - Trophy outline
- `create_seasons_icon()` - Calendar outline
- `create_settings_icon()` - Gear outline
- `create_users_nav_icon()` - Two person outlines

### Stat Card Icons (24x24px)
- `create_building_icon()` - Building with windows
- `create_users_icon()` - Two people silhouettes
- `create_location_icon()` - Location pin
- `create_chart_icon()` - Bar chart

### UI Elements
- `create_avatar()` - Circular avatar with initials
- `create_menu_dots()` - Vertical three-dot menu

## Step 6: Execute and Validate

// turbo
1. Run the reconstruction script:
```bash
python scripts/precision_sX_screenname.py
```

2. Check Figma for the created frame

3. Compare with original screenshot:
   - Layout matches
   - Colors are correct
   - Icons are geometric and visible
   - Text is accurate
   - Spacing is precise

## Step 7: Iterate if Needed

If not pixel-perfect:
1. Identify specific differences
2. Update positions/sizes in the script
3. Delete the old frame in Figma
4. Re-run the script
5. Validate again

## Common Patterns

### Form Inputs

```python
lib.create_input_field(f_id, x, y, "EMAIL ADDRESS", "admin@platform.com", width=340)
```

### Buttons

```python
lib.create_button(f_id, x, y, "Sign In", width=340, height=48, primary=True)
```

### Custom Cards

```python
lib.create_rectangle(f_id, x, y, width, height, "Card Name",
                    fill_color=DESIGN_TOKENS["card_glass"],
                    corner_radius=12,
                    stroke_color=DESIGN_TOKENS["card_border"],
                    stroke_weight=1)
```

## Important Notes

### Color Handling

The `parse_rgba()` function handles:
- Hex colors: `"#22d3ee"`
- RGBA colors: `"rgba(255, 255, 255, 0.1)"`
- Transparent: `"transparent"` (alpha = 0)

### Icon Creation

**DO:**
- Use geometric icon methods from the library
- Match colors to active/inactive states
- Use consistent sizes (16px nav, 24px cards)

**DON'T:**
- Use emojis (they don't match the design)
- Use text-based icons
- Skip icons (they're important for visual fidelity)

### Positioning

- Sidebar: Usually 140px wide
- Content starts: `sidebar_width + 60px`
- Card spacing: 20-24px between cards
- Padding: 20-24px inside cards
- Row height in tables: 50px

### Typography Scale

- Page titles: 32px, weight 700
- Section titles: 18px, weight 600
- Card labels: 10-11px, weight 600, uppercase
- Card values: 32-36px, weight 700
- Body text: 13-14px, weight 400-500
- Captions: 11-12px, weight 400

## Troubleshooting

**Issue: Icons not visible**
- Check that you're calling the icon methods, not using emojis
- Verify color matches background (use correct active/inactive color)
- Ensure icon is added to correct parent

**Issue: Colors look different**
- Verify hex values are correct
- Check alpha channel for rgba colors
- Use `parse_rgba()` for all colors

**Issue: Layout is off**
- Double-check x, y coordinates
- Verify parent-child relationships
- Check that sidebar width is accounted for

**Issue: Transparent fills not working**
- Use `fill_color="transparent"` (now supported)
- For strokes only, set `fill_color="transparent"` and provide `stroke_color`

## Advanced: Image Import (Future)

The plugin now supports `import_image` command (requires restart):

```python
# Convert image to base64
import base64
with open("icon.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

# Import image
agent.execute({"action": "import_image", "parameters": {
    "x": 100, "y": 100,
    "width": 24, "height": 24,
    "imageData": f"data:image/png;base64,{image_data}",
    "name": "Icon",
    "parentId": parent_id
}})
```

## Advanced: Using Figma Community Components

The MCP now supports using components from Figma community libraries like icon sets!

### Popular Icon Libraries

- **Feather Icons** - Clean, minimal outline icons
- **Heroicons** - Beautiful hand-crafted SVG icons
- **Material Icons** - Google's Material Design icons  
- **Font Awesome** - Comprehensive icon library
- **Lucide** - Fork of Feather Icons with more icons

### Step 1: Find Component Library

1. Go to Figma Community (https://www.figma.com/community)
2. Search for icon library (e.g., "Feather Icons")
3. Copy the file key from URL (e.g., `fKAZlTWPWxh2aRIEfF3xXi`)

### Step 2: Enable Library in Figma

**Manual Method (Recommended):**
1. Open the community file in Figma
2. Click "Enable as library" in the file
3. The library is now available in your file

**Programmatic Method (Future):**
```python
# Import library by file key
agent.execute({"action": "import_component_library", "parameters": {
    "fileKey": "fKAZlTWPWxh2aRIEfF3xXi"  # Feather Icons example
}})
```

### Step 3: List Available Components

```python
# Get all local components
result = agent.execute({"action": "get_local_components", "parameters": {}})
components = result.get("result", [])

# Print component names and keys
for comp in components:
    print(f"{comp['name']}: {comp['key']}")
```

### Step 4: Find Specific Icon

```python
# Search for specific component by name
result = agent.execute({"action": "get_component_by_name", "parameters": {
    "name": "home",  # Icon name
    "libraryName": "Feather Icons"  # Optional: specific library
}})

if result.get("result"):
    component_key = result["result"]["key"]
```

### Step 5: Use Component in Design

```python
# Create instance of icon component
agent.execute({"action": "create_component_instance", "parameters": {
    "componentKey": component_key,
    "x": 100,
    "y": 100,
    "parentId": parent_id  # Optional
}})
```

### Complete Example: Using Feather Icons

```python
from agents.figma_designer.figma_designer_agent import FigmaDesignerAgent

agent = FigmaDesignerAgent()

# 1. Get all components
components_result = agent.execute({"action": "get_local_components", "parameters": {}})
components = components_result.get("result", [])

# 2. Find icons by name
icon_names = ["home", "user", "settings", "menu", "search"]
icon_components = {}

for comp in components:
    comp_name = comp.get("name", "").lower()
    for icon_name in icon_names:
        if icon_name in comp_name:
            icon_components[icon_name] = comp["key"]
            break

# 3. Create frame
frame_result = agent.execute({"action": "create_frame", "parameters": {
    "name": "Icons", "width": 400, "height": 100, "x": 0, "y": 0
}})
f_id = frame_result["result"]["id"]

# 4. Place icons
for i, (name, key) in enumerate(icon_components.items()):
    agent.execute({"action": "create_component_instance", "parameters": {
        "componentKey": key,
        "x": i * 60 + 20,
        "y": 40,
        "parentId": f_id
    }})
    print(f"Placed {name} icon")
```

### Tips for Using Community Components

1. **Enable libraries first** - Components must be from enabled libraries
2. **Search by exact name** - Component names are case-sensitive
3. **Check component keys** - Keys are unique identifiers
4. **Resize after placement** - Use `resize_node` to adjust size
5. **Change colors** - Use `set_fill_color` to match your design

### Common Icon Libraries and Their Keys

| Library | File Key | Notes |
|---------|----------|-------|
| Feather Icons | `fKAZlTWPWxh2aRIEfF3xXi` | Clean outline icons |
| Heroicons | Various | Multiple versions available |
| Material Icons | Various | Google's icon set |
| Lucide | Various | Extended Feather Icons |

**Note:** File keys may change. Always verify from the community page.

### Fallback: Geometric Icons

If community components aren't available, use the geometric icon library:

```python
from shared.figma_components import FigmaComponentLibrary

lib = FigmaComponentLibrary(agent)

# Use geometric icons
lib.create_dashboard_icon(f_id, x, y, size=16, color="#22d3ee")
lib.create_users_icon(f_id, x, y, size=24, color="#22d3ee")
```

## Best Practices

1. **Work incrementally** - Build one section at a time
2. **Use the library** - Don't recreate common components
3. **Match colors exactly** - Use color picker on screenshots
4. **Test frequently** - Run script after each major section
5. **Document tokens** - Keep all colors in TOKENS dict
6. **Geometric icons** - Use library methods, not emojis
7. **Consistent spacing** - Follow the design system
8. **Version control** - Commit working versions

## Component Library Reference

Located at: `shared/figma_components.py`

Key classes:
- `FigmaComponentLibrary` - Main component library
- `DESIGN_TOKENS` - Global color/style tokens
- `parse_rgba()` - Color conversion utility

All methods return node IDs that can be used as parent IDs for nesting.

## Next Steps

After completing one screen:
1. Save the script with descriptive name (`precision_sX_name.py`)
2. Document any custom patterns used
3. Move to the next screenshot
4. Reuse library methods and patterns
5. Build up a collection of reusable scripts
