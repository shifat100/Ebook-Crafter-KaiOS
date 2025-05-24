# Ebook-Crafter-KaiOS: Documentation for Content Creators

**Table of Contents:**

1.  **Overview**
2.  **Core Concepts: How it Works**
3.  **Directory Structure: Where to Put Your Files**
4.  **Creating Your Content:**
    *   Menu Files (`.mnu`)
    *   Text Content Files (`.txt`)
    *   Images
    *   Links
5.  **Customizing the Appearance and Behavior:**
    *   The `settings.txt` File (Detailed Breakdown)
    *   Custom Images (Vendor Logo, Backgrounds)
    *   Custom Sound
6.  **Understanding the User Interface (UI)**
7.  **Preparing Your App for KaiOS**
8.  **Tips and Best Practices**

---

### 1. Overview

Ebook-Crafter-KaiOS is an HTML/JavaScript application designed for KaiOS feature phones. It allows you to create a structured, navigable application using simple text files for menus and content. Think of it as a framework for:

*   Simple e-books or story collections
*   Information guides or FAQs
*   Tutorials or step-by-step instructions
*   Offline wikis or knowledge bases

The application features a startup sequence (vendor logo, optional sound confirmation, splash screen) and then a main interface for navigating menus and reading text.

---

### 2. Core Concepts: How it Works

The app works based on a few key file types:

*   **`index.html`**: The main application file (you are looking at its code). You generally don't need to edit this unless you are a developer.
*   **`.mnu` files**: Define the menus. Each menu item has a display name and a target (another `.mnu` file or a `.txt` file).
*   **`.txt` files**: Contain the actual text content you want to display. They can also include references to images and external web links.
*   **`settings.txt`**: A crucial file that controls the visual appearance (colors, fonts, backgrounds) and some behaviors (scrolling speed, sound prompts) of the application.
*   **Image files (`.png`, `.jpg`, etc.)**: Used for logos, backgrounds, and inline content images.
*   **Sound files (`.mp3`)**: For background music.

When the app starts, it loads `sys/main.mnu` by default. Clicking a menu item will either load another `.mnu` file (a submenu) or a `.txt` file (content).

---

### 3. Directory Structure: Where to Put Your Files

To create your content, you'll need to organize your files in specific folders:

```
Your_App_Name/
├── index.html            (The main app file - don't change unless you know JS)
│
├── img/                  (Folder for ALL images)
│   ├── vendor_logo.png   (Your brand/app logo, shown at startup)
│   ├── fon.png           (Main background image for app & splash screen)
│   ├── soft_1.png        (Background for the top status bar)
│   ├── soft_2.png        (Background for the bottom softkey bar)
│   └── (your_content_image1.jpg)
│   └── (your_content_image2.png)
│   └── ...
│
├── snd/                  (Folder for sound files)
│   └── music.mp3         (Background music file)
│
├── sys/                  (Folder for system and menu files)
│   ├── settings.txt      (THEME and behavior settings - VERY IMPORTANT)
│   ├── main.mnu          (The first menu loaded by the app)
│   └── (your_submenu1.mnu)
│   └── (your_other_menu.mnu)
│   └── ...
│
└── text/                 (Folder for your actual text content)
    ├── (your_chapter1.txt)
    ├── (your_article_about_topic.txt)
    └── ...
```

---

### 4. Creating Your Content

This is where you "write your book" or build your information app.

#### a. Menu Files (`.mnu`)

*   **Location**: `sys/` folder.
*   **Naming**: Use descriptive names, e.g., `main.mnu`, `chapters.mnu`, `help.mnu`.
*   **Format**:
    *   Each menu item consists of **two lines**.
    *   The **first line** is the **text displayed** for the menu item.
    *   The **second line** is the **target file** (another `.mnu` file in `sys/` or a `.txt` file in `text/`) or a special command.
    *   Leave an empty line between menu items if you prefer for readability, but the parser ignores them.

*   **Example (`sys/main.mnu`):**
    ```
    Chapter 1: The Beginning
    chapter1.txt
    Chapter 2: The Journey
    chapter2.txt
    More Options
    options_menu.mnu
    Exit Application
    [EXIT]
    ```

*   **Targets:**
    *   `filename.txt`: Loads `text/filename.txt`.
    *   `filename.mnu`: Loads `sys/filename.mnu`.
    *   `[EXIT]`: A special command to provide an option to close the application.

#### b. Text Content Files (`.txt`)

*   **Location**: `text/` folder.
*   **Naming**: Use descriptive names, e.g., `introduction.txt`, `how_to_install.txt`.
*   **Format**: Plain text files. The app will display the text as paragraphs.

*   **Example (`text/chapter1.txt`):**
    ```
    This is the first paragraph of Chapter 1.
    It can span multiple lines in your text editor, and will be formatted nicely in the app.

    This is a new paragraph. You create paragraphs by leaving an empty line between blocks of text.

    You can also include images:
    [IMG]
    my_image.png

    And even links to websites:
    ###
    Visit KaiOS Official Website
    https://www.kaiostech.com
    ###

    More text can follow after the image or link.
    ```

#### c. Images

*   **Inline Images in `.txt` files:**
    1.  Place your image file (e.g., `my_image.png`) inside the `img/` folder.
    2.  In your `.txt` file, use the following format on two separate lines:
        ```
        [IMG]
        my_image.png
        ```
    *   The image will be displayed, centered, with a max-width of 100%.

*   **Special Images (Backgrounds, Logos):**
    *   `img/vendor_logo.png`: Displayed on the very first startup screen.
    *   `img/fon.png`: Used as the background for the main application content area and the splash screen.
    *   `img/soft_1.png`: Background for the status bar (top).
    *   `img/soft_2.png`: Background for the softkey bar (bottom).
    *   **Recommendation**: Keep these images optimized for size to ensure fast loading on feature phones. For `fon.png`, a subtle texture or gradient often works best. For `vendor_logo.png`, ensure it looks good on a black background.

#### d. Links

*   **External Web Links in `.txt` files:**
    1.  In your `.txt` file, use the following block format:
        ```
        ###
        Display Text for the Link
        https://www.example.com/your-url-here
        ###
        ```
    *   `###`: Marks the beginning and end of a link definition.
    *   **Line 1 (after first `###`)**: The text that will be shown to the user for the link (e.g., "Read More Here").
    *   **Line 2**: The actual URL (e.g., `http://example.com`).
    *   When a `.txt` file containing links is displayed, a "LINKS" option will appear on the left softkey. Pressing it will show a list of all links found in that text file. Selecting a link will attempt to open it in the phone's browser (requires internet connection).

---

### 5. Customizing the Appearance and Behavior

The primary way to customize the app is through `sys/settings.txt` and by replacing default images.

#### a. The `settings.txt` File

*   **Location**: `sys/` folder.
*   **Format**: Each line corresponds to a specific setting. The value is before the first `-` (hyphen). Comments can be added after a hyphen. The order of lines is **critical** and must not be changed. If a line is missing or a value is invalid, a default will be used.

Here's a breakdown of each setting in `sys/settings.txt`:

```
# Value format: R,G,B (e.g., 0,0,0 for black) or A,R,G,B (e.g., 255,255,0,0 for opaque red)
# A = Alpha/Transparency (0-255, 0=transparent, 255=opaque)
# R,G,B = Red, Green, Blue (0-255)

# 1. bgColor: Main background color of the app (if no image or image fails)
#    Format: R,G,B
0,0,0                     - Body background color (e.g., 0,0,0 for black)

# 2. menuFontColor: Color of text in menu lists (non-selected items)
#    Format: A,R,G,B
255,200,200,200           - Menu item font color (e.g., 255,200,200,200 for light gray/pink)

# 3. menuSelectedSettings: Background color of the selected menu item
#    Format: A,R,G,B
255,255,255,255           - Menu selected item background color (e.g., 255,255,255,255 for white)
                          - (Selected text color will be auto-calculated for contrast)

# 4. textFontColor: Color of the main content text in .txt files
#    Format: R,G,B
255,255,255,255           - Content viewer text color (e.g., 255,255,255 for white)

# 5. scrollbarMainColor: Color of the scrollbar thumb
#    Format: A,R,G,B
255,0,0,0                 - Scrollbar thumb color (e.g., 255,0,0,0 for black)

# 6. scrollbarBorderColor: Color of the scrollbar track/border
#    Format: A,R,G,B
127,255,255,255           - Scrollbar track color (e.g., 127,255,255,255 for semi-transparent white)

# 7. cursorBorderColor: Not directly used for a visible cursor border, but caret-color uses cursorMainColor
#    Format: R,G,B (This specific one seems to be less impactful or for a legacy feature)
100,100,100               - Text input cursor border (less visible in this app)

# 8. cursorMainColor: Color of the blinking text input caret (rarely seen in this app type)
#    Format: R,G,B
0,0,0                     - Text input cursor main color (e.g. black, for contrast on light backgrounds)

# 9. clockMainColor: Color of the text in the status bar (top of screen)
#    Format: A,R,G,B
255,255,255,255           - Status bar text/clock color (e.g., 255,255,255,255 for white)

# 10. clockBorderColor: Text shadow color for status bar text (creates an outline effect)
#     Format: A,R,G,B (used for text-shadow)
255,0,0,0                 - Status bar text/clock border/shadow color (e.g., 255,0,0,0 for black)

# 11. lineSpacing: Additional spacing between lines of text in content view (in pixels)
#     Format: Number (e.g., 2)
2                         - Line spacing in pixels for .txt content (e.g., 2 for 2px extra spacing)

# 12. bgImageDimLevel: How much to dim the background image 'fon.png'. 0=no dim, 255=fully black overlay
#     Format: Number (0-255)
60                        - Background image dim level (0-255, e.g., 60 for slight dimming)

# 13. useBgImage: Whether to use 'img/fon.png' as the background.
#     Format: yes or no
yes                       - Use background image (yes/no)

# 14. promptSound: Whether to ask the user "Enable Sound?" at startup.
#     Format: yes or no
yes                       - Prompt for sound at startup (yes/no)

# 15. manualScrollAmount: How many pixels to scroll with Arrow Up/Down or 2/8 keys in text view.
#     Format: Number
30                        - Manual scroll step in pixels (e.g., 30)

# 16. autoScrollSpeedBase: Base speed for auto-scrolling (pixels per interval). Can be adjusted with 4/6 keys.
#     Format: Number
1                         - Auto-scroll speed base (pixels per tick, e.g., 1)
```

**How to use color values:**
*   **RGB (Red, Green, Blue):** `R,G,B` where each value is 0-255. Example: `255,0,0` is pure red.
*   **ARGB (Alpha, Red, Green, Blue):** `A,R,G,B` where Alpha is transparency (0=fully transparent, 255=fully opaque). Example: `128,0,255,0` is semi-transparent green.

#### b. Custom Images

As mentioned in the Directory Structure:

*   **`img/vendor_logo.png`**: Your app's or brand's logo. Shown for 2 seconds at startup.
    *   *Tip*: Use a PNG with transparency if your logo isn't rectangular. Ensure it's visible against a black background.
*   **`img/fon.png`**: The background image for the main app view and the splash screen (shown for 2.5 seconds after logo/sound prompt).
    *   *Tip*: Subtle patterns or textures work well. Highly detailed images might be distracting or make text hard to read. The `bgImageDimLevel` setting can help.
*   **`img/soft_1.png`**: Background for the status bar (top area displaying title/clock).
*   **`img/soft_2.png`**: Background for the softkey bar (bottom area with softkey labels).
    *   *Tip*: These are often simple gradients or solid colors matching your theme. Keep them small in file size. Dimensions should roughly match typical KaiOS screen widths (240px or 320px) and short heights (e.g., 20-30px).

Simply replace these files in the `img/` folder with your own creations.

#### c. Custom Sound

*   **`snd/music.mp3`**: The background music file.
    *   Replace this file with your desired `.mp3` music.
    *   Keep it relatively small and ensure it loops well if desired (the app sets it to loop).
    *   If `promptSound` in `settings.txt` is "yes", users will be asked if they want to enable sound. If "no", sound will be disabled by default for the session.

---

### 6. Understanding the User Interface (UI)

The UI is typical for KaiOS:

*   **Status Bar (Top)**: Displays the current menu title or text file title. A clock might appear if the system provides it.
*   **Main Content Area**:
    *   Shows the list of menu items (navigable with Up/Down D-pad).
    *   Shows the content of `.txt` files.
*   **Softkey Bar (Bottom)**: Displays context-sensitive actions for the Left, Center, and Right softkeys.

**Key Mappings (during main app usage):**

*   **D-Pad Up/Down**:
    *   Menu View: Navigate up/down through menu items.
    *   Text View (Manual Scroll): Scroll content up/down by `manualScrollAmount`.
    *   Text View (Auto Scroll): Decrease/Increase auto-scroll speed.
*   **Center Key / Enter**:
    *   Menu View: Select the highlighted menu item (opens submenu or text file).
    *   Text View: Toggle auto-scroll On/Off.
    *   Link List View: Open the selected link.
*   **Left Softkey**:
    *   Text View (if links exist): "LINKS" - Opens the list of links from the current text.
*   **Right Softkey**:
    *   "BACK": Navigates to the previous menu or text file in history.
    *   "EXIT": If at the main menu, exits the application.
    *   "CLOSE": Closes the Link List overlay.
*   **Numeric Keys (in Text View, when not auto-scrolling):**
    *   `1`: Scroll to top.
    *   `2`: Scroll up (larger step).
    *   `3`: Scroll to bottom.
    *   `8`: Scroll down (larger step).
*   **Numeric Keys (in Text View, when auto-scrolling):**
    *   `4`: Decrease auto-scroll speed.
    *   `6`: Increase auto-scroll speed.
*   **Numeric Key (in Text View):**
    *   `5`: Toggle auto-scroll (same as Center Key).
*   **Backspace Key**: Acts like the "BACK" softkey (Right Softkey).

**Startup Sequence UI:**
1.  **Vendor Logo Screen**: Displays `img/vendor_logo.png`. No softkeys.
2.  **Sound Confirmation Screen** (if `promptSound` is "yes"):
    *   "Enable Sound?"
    *   Left Softkey: YES
    *   Right Softkey: NO
3.  **Splash Screen**: Displays `img/fon.png` as background. No softkeys.

---

### 7. Preparing Your App for KaiOS

1.  **Gather all your files**: `index.html`, and your populated `img/`, `snd/`, `sys/`, and `text/` folders.
2.  **Create a `manifest.webapp` file** (if you don't have one). This file tells the KaiOS device about your app. A minimal example:
    ```json
    {
      "version": "1.0.0",
      "name": "My Awesome Book App",
      "description": "An amazing collection of stories and info.",
      "launch_path": "/index.html",
      "icons": {
        "56": "/img/icon_56.png",  // You'll need to create these icon files
        "112": "/img/icon_112.png" // Place them in your img/ folder
      },
      "developer": {
        "name": "Your Name",
        "url": "http://example.com"
      },
      "type": "web",
      "fullscreen": "true",
      "permissions": {
        "audio-channel-content": { // If you use background music
          "description" : "Required for background music"
        },
        "feature-detection": { // Good to have for KaiOS
            "description": "Detecting device features"
        }
        // If you plan to use MozActivity for other things, add permissions here
      },
      "locales": {
        "en-US": {
          "name": "My Awesome Book App",
          "description": "An amazing collection of stories and info."
        }
      },
      "default_locale": "en-US"
    }
    ```
    *   **Important**: Create `icon_56.png` and `icon_112.png` and place them in your `img/` folder. These are your app's icons.
3.  **Zip your application**: Select `index.html`, the `manifest.webapp` file, and the `img/`, `snd/`, `sys/`, `text/` folders, and create a ZIP archive (e.g., `my_app.zip`).
4.  **Deploy**: This ZIP file can then be sideloaded onto a KaiOS device for testing using tools like WebIDE, or submitted to the KaiStore (if you meet their guidelines).

---

### 8. Tips and Best Practices

*   **Keep it Simple**: Feature phones have limited resources. Avoid overly complex menus or excessively large text files/images.
*   **Test Thoroughly**: Test on an actual KaiOS device or a reliable emulator. What looks good on a desktop browser might behave differently on the phone.
*   **Optimize Images**: Use tools to compress your PNGs and JPGs to reduce file size.
*   **Clear Navigation**: Design your menus logically so users can easily find what they're looking for.
*   **Readable Text**: Choose colors in `settings.txt` that provide good contrast between text and background.
*   **Backup Your Work**: Keep backups of your content files (`.mnu`, `.txt`) and `settings.txt`.
*   **Incremental Changes**: When customizing `settings.txt`, change one or two things at a time and test, so you know what effect each change has.

This framework provides a solid foundation for creating text-rich applications for KaiOS. By understanding its structure and customization options, you can build engaging and informative experiences for feature phone users. Happy composing!
