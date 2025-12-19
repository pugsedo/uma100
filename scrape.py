import os
import json
import requests
from lxml import html
from urllib.parse import urljoin

BASE_URL = "https://umamusu.wiki"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

session = requests.Session()
session.headers.update(HEADERS)

# -----------------------
# Helpers
# -----------------------

def safe_name(name):
    return name.replace("/", "_")

def download_image(url, path):
    r = session.get(url)
    r.raise_for_status()
    with open(path, "wb") as f:
        f.write(r.content)

# -----------------------
# Setup folders
# -----------------------

os.makedirs("public/data/characters", exist_ok=True)

# -----------------------
# Load character list
# -----------------------

resp = session.get(f"{BASE_URL}/List_of_Characters")
tree = html.fromstring(resp.content)

grid = tree.xpath('/html/body/div[3]/div[3]/div[5]/div[1]/div[2]')[0]
icon_boxes = grid.xpath('.//div[contains(@class,"icon-box")]')

all_data = []

# -----------------------
# Main loop
# -----------------------

for box in icon_boxes:
    name = box.xpath('.//div[contains(@class,"name-box")]/a/text()')[0].strip()
    page_href = box.xpath('.//div[contains(@class,"name-box")]/a/@href')[0]
    page_url = urljoin(BASE_URL, page_href)

    thumb_src = box.xpath('.//img/@src')[0]
    thumb_url = urljoin(BASE_URL, thumb_src)

    folder_name = safe_name(name)
    char_dir = f"public/data/characters/{folder_name}"
    os.makedirs(char_dir, exist_ok=True)

    # -----------------------
    # Download thumb
    # -----------------------

    thumb_path = f"{char_dir}/thumb.png"
    download_image(thumb_url, thumb_path)

    # -----------------------
    # Load character page
    # -----------------------

    char_resp = session.get(page_url)
    char_tree = html.fromstring(char_resp.content)

    content = char_tree.xpath('//div[contains(@class,"mw-parser-output")]')[0]

    # -----------------------
    # Full body image (Main tab)
    # -----------------------

    full_img = content.xpath(
        './/table[contains(@class,"infobox")]//article[contains(@class,"tabber__panel")][1]//img/@src'
    )

    full_img_url = urljoin(BASE_URL, full_img[0]) if full_img else None
    full_path = f"{char_dir}/full.png"

    if full_img_url:
        download_image(full_img_url, full_path)

    # -----------------------
    # Info paragraph
    # (first non-empty <p> after infobox)
    # -----------------------

    info_text = ""
    paragraphs = content.xpath('./p[normalize-space()]')
    if paragraphs:
        info_text = paragraphs[0].text_content().strip()

    # -----------------------
    # Trivia
    # -----------------------

    trivia_items = content.xpath(
        './/h2[span[@id="Trivia"]]/following-sibling::ul[1]/li'
    )

    trivia = [li.text_content().strip() for li in trivia_items]

    # -----------------------
    # Store entry
    # -----------------------

    all_data.append({
        "name": name,
        "thumb": f"characters/{folder_name}/thumb.png",
        "full": f"characters/{folder_name}/full.png",
        "info": info_text,
        "trivia": trivia
    })

    print(f"✓ {name}")

# -----------------------
# Write data.json
# -----------------------

with open("public/data/data.json", "w", encoding="utf-8") as f:
    json.dump(all_data, f, ensure_ascii=False, indent=2)

print(f"\nDone. Saved {len(all_data)} characters.")
