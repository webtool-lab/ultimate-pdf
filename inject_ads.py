import os

# Configuration
target_dir = "d:/Ultimate-pdf-tools"
files_to_process = [
    "compress.html",
    "delete-pages.html",
    "images-to-pdf.html",
    "merge.html",
    "page-numbers.html",
    "reader.html",
    "reorder-pages.html",
    "rotate.html",
    "signature.html",
    "split.html",
    "watermark.html"
]

# Ad Snippets
top_ad = """
    <!-- AD: Top Banner -->
    <div class="ad ad-banner ad-top" role="complementary" aria-label="Advertisement">
      <div class="ad-content">
        <span class="ad-placeholder">Advertisement</span>
        <!-- Google AdSense Code -->
      </div>
    </div>
"""

middle_ad = """
    <!-- AD: Middle -->
    <div class="ad ad-inline" role="complementary" aria-label="Advertisement">
      <div class="ad-content">
        <span class="ad-placeholder">Advertisement</span>
        <!-- Google AdSense Code -->
      </div>
    </div>
"""

footer_ad = """
    <!-- AD: Footer -->
    <div class="ad ad-footer" role="complementary" aria-label="Advertisement">
      <div class="ad-content">
        <span class="ad-placeholder">Advertisement</span>
        <!-- Google AdSense Code -->
      </div>
    </div>
"""

def inject_ads(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # check if already injected to avoid duplicates (basic check)
    if "<!-- AD: Top Banner -->" in content:
        print(f"Skipping {filepath}: Ads already appear to be present.")
        return

    # 1. Inject Top Ad after <main class="tool-page">
    if '<main class="tool-page">' in content:
        content = content.replace('<main class="tool-page">', '<main class="tool-page">' + top_ad, 1)
    else:
        print(f"Warning: Could not find <main class='tool-page'> in {filepath}")

    # 2. Inject Middle Ad before <div class="tool-info">
    if '<div class="tool-info">' in content:
        content = content.replace('<div class="tool-info">', middle_ad + '\n    <div class="tool-info">', 1)
    else:
        print(f"Warning: Could not find <div class='tool-info'> in {filepath}")

    # 3. Inject Footer Ad before <div class="footer-bottom"> inside footer
    # locating the footer bottom div
    if '<div class="footer-bottom">' in content:
        content = content.replace('<div class="footer-bottom">', footer_ad + '\n    <div class="footer-bottom">', 1)
    else:
        print(f"Warning: Could not find <div class='footer-bottom'> in {filepath}")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filepath}")

def main():
    for filename in files_to_process:
        filepath = os.path.join(target_dir, filename)
        if os.path.exists(filepath):
            inject_ads(filepath)
        else:
            print(f"File not found: {filepath}")

if __name__ == "__main__":
    main()
