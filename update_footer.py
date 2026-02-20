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
    "watermark.html",
    "contact.html", "about.html", "disclaimer.html", "faq.html", "legal.html", "privacy.html", "terms.html"
]

# New Footer Content
new_footer_list = """        <h4>Tools</h4>
        <ul>
          <li><a href="merge.html">Merge PDF</a></li>
          <li><a href="split.html">Split PDF</a></li>
          <li><a href="compress.html">Compress PDF</a></li>
          <li><a href="rotate.html">Rotate PDF</a></li>
          <li><a href="images-to-pdf.html">Images to PDF</a></li>
          <li><a href="delete-pages.html">Delete Pages</a></li>
          <li><a href="reorder-pages.html">Reorder Pages</a></li>
          <li><a href="reader.html">PDF Reader</a></li>
          <li><a href="watermark.html">Watermark PDF</a></li>
          <li><a href="page-numbers.html">Page Numbers</a></li>
          <li><a href="signature.html">Add Signature</a></li>
        </ul>
      </div>"""

# Old Footer Pattern (to replace)
# We need to be careful with regex matching or just use a known robust replacement if the structure is identical.
# Since the previous content was:
#         <h4>Product</h4>
#         <ul>
#           <li>Merge PDF</li>
#           <li>Compress PDF</li>
#           <li>Convert PDF</li>
#           <li>Split PDF</li>
#         </ul>
#       </div>
# I will try to find this exact block. But some files might be slightly different or I might miss indentations.
# A safer bet is to target the "Product" column div specifically if I can identify it uniquely.

# Let's inspect `reader.html` content via read first or just try to replace the known block.
# The user provided `index.html` structure. It's likely copied.

target_block_start = "<h4>Product</h4>"
target_block_end = "</ul>\n      </div>"

# I will define a function that looks for the `<h4>Product</h4>` and replaces the whole logical block until the closing div.
# Or simpler: The specific `<ul>` block.

def update_footer(filepath):
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The block we want to replace might vary slightly in indentation or content if I changed it before?
    # No, I haven't changed the footer in other files yet.
    # The snippet in index.html was:
    # <h4>Product</h4>
    # <ul>
    #   <li>Merge PDF</li>
    #   <li>Compress PDF</li>
    #   <li>Convert PDF</li>
    #   <li>Split PDF</li>
    # </ul>
    # </div>

    # Let's constructing a flexible regex replacement or just use simple string replacement if we trust exact match.
    # Given the project nature, it's likely identical.
    
    old_block_snippet = """<h4>Product</h4>
        <ul>
          <li>Merge PDF</li>
          <li>Compress PDF</li>
          <li>Convert PDF</li>
          <li>Split PDF</li>
        </ul>
      </div>"""
    
    # Try exact match first
    if old_block_snippet in content:
        content = content.replace(old_block_snippet, new_footer_list)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        # Fallback: maybe indentation is different?
        # Let's try to find just the list part if it exists.
        print(f"Could not find exact footer match in {filepath}. Checking manually...")

def main():
    for filename in files_to_process:
        filepath = os.path.join(target_dir, filename)
        update_footer(filepath)

if __name__ == "__main__":
    main()
