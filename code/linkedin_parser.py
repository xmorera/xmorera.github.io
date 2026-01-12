import re
import os
import unicodedata
from pathlib import Path
from datetime import date
from typing import List

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None  # Will be checked in main()

CURRENT_DATE = date(2026, 1, 12)


def subtract_months(dt: date, months: int) -> date:
    y = dt.year
    m = dt.month - months
    while m <= 0:
        m += 12
        y -= 1
    return date(y, m, 1)


def parse_relative_month(sub_description: str) -> date:
    # Handles values like "8mo", "1y", "2w", "3d", "9h". We output month-level dates.
    m = re.search(r"(\d+)\s*(mo|y|w|d|h)", sub_description)
    if not m:
        return CURRENT_DATE.replace(day=1)
    n = int(m.group(1))
    unit = m.group(2)
    if unit == "mo":
        return subtract_months(CURRENT_DATE, n)
    if unit == "y":
        return subtract_months(CURRENT_DATE, n * 12)
    # For weeks/days/hours, just keep current month
    return CURRENT_DATE.replace(day=1)


def slugify(title: str) -> str:
    t = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode("ascii")
    t = t.lower()
    t = re.sub(r"[^a-z0-9]+", "-", t).strip("-")
    return t[:80]


def clean_text(s: str) -> str:
    s = s.replace("\r", "")
    # Collapse multiple newlines
    s = re.sub(r"\n\n+", "\n\n", s)
    # Trim trailing spaces per line
    s = "\n".join(line.rstrip() for line in s.splitlines())
    return s.strip()


def extract_actor_name_from_container(container) -> str | None:
    # Try aria-label on meta-link first
    link = container.select_one('a.update-components-actor__meta-link')
    if link and link.has_attr('aria-label'):
        label = link['aria-label']
        # e.g., "View: Xavier Morera Verified …" → find name substring
        m = re.search(r"View:\s*(.*?)\s*(Verified|$)", label)
        if m:
            return m.group(1).strip()
        return label.strip()
    # Fallback to visible title text
    title = container.select_one('.update-components-actor__title')
    if title:
        txt = title.get_text(separator=" ", strip=True)
        return txt or None
    return None


def extract_sub_description_from_container(container) -> str | None:
    sub = container.select_one('.update-components-actor__sub-description')
    if not sub:
        return None
    return sub.get_text(separator=" ", strip=True)


def extract_commentary_text_from_container(container) -> str | None:
    comm = container.select_one('.update-components-update-v2__commentary')
    if not comm:
        return None
    txt = comm.get_text(separator="\n", strip=True)
    return clean_text(txt)


def extract_image_urls_from_container(container, base_dir: Path) -> List[str]:
    urls: List[str] = []
    # Direct <img> tags within the update content
    for img in container.select('.update-components-image img, img'):
        for attr in ('src', 'data-delayed-url', 'data-src'):
            u = img.get(attr)
            if not u:
                continue
            if 'media.licdn.com' in u:
                urls.append(u)

    # Embedded native documents via iframe
    for iframe in container.select('iframe.document-s-container__document-element'):
        src = iframe.get('src')
        if not src:
            continue
        # Resolve the iframe file relative to the input HTML location
        iframe_path = (base_dir / src).resolve()
        if iframe_path.exists():
            try:
                html = iframe_path.read_text(errors='ignore')
                soup_doc = BeautifulSoup(html, 'html.parser')
                for img in soup_doc.select('img'):
                    for attr in ('data-src', 'src'):
                        u = img.get(attr)
                        if u and 'media.licdn.com' in u:
                            urls.append(u)
            except Exception:
                pass

    # Deduplicate while preserving order
    seen = set()
    out = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            out.append(u)
    return out


def pick_title(text: str) -> str:
    # Use first non-empty line as title, truncated reasonably
    for line in text.splitlines():
        line = line.strip()
        if line:
            return line[:120]
    return "Untitled"


def write_markdown(out_dir: Path, dt: date, title: str, body: str, images: list[str]) -> Path:
    slug = slugify(title or "post") or "post"
    fname = f"{dt.strftime('%Y-%m-%d')}--{slug}.md"
    path = out_dir / fname
    lines = []
    lines.append(f"# {title}")
    lines.append(dt.strftime("%Y-%m-%d"))
    lines.append("")
    lines.append(body.strip())
    if images:
        lines.append("")
        lines.append("Images:")
        for u in images:
            lines.append(f"- {u}")
    path.write_text("\n".join(lines))
    return path


def main():
    input_path = Path("/Users/xavier/github/xmorera/xmorera.github.io/linkedin-for-processing/posts/(23) Activity _ Xavier Morera _ LinkedIn.html")
    output_dir = Path("/Users/xavier/github/xmorera/xmorera.github.io/linkedin-for-processing/intermediate/posts")
    output_dir.mkdir(parents=True, exist_ok=True)

    if BeautifulSoup is None:
        raise SystemExit("beautifulsoup4 is required. Please install it and retry.")

    html = input_path.read_text(errors="ignore")
    soup = BeautifulSoup(html, 'html.parser')

    created = 0
    base_dir = input_path.parent

    # Iterate over each update card
    for card in soup.select('div.feed-shared-update-v2'):
        actor = extract_actor_name_from_container(card) or ""
        if "Xavier Morera" not in actor:
            continue

        sub = extract_sub_description_from_container(card) or ""
        dt = parse_relative_month(sub)

        commentary = extract_commentary_text_from_container(card)
        if not commentary:
            continue

        title = pick_title(commentary)
        images = extract_image_urls_from_container(card, base_dir)
        write_markdown(output_dir, dt, title, commentary, images)
        created += 1

    print(f"Created {created} Markdown files in {output_dir}")


if __name__ == "__main__":
    main()
