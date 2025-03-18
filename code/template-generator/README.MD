# Template Generator

## Overview
`template_generator.py` is a lightweight Python CLI tool that helps you generate markdown writing templates for each **weekday** of a given month and year. It automatically creates the folder structure and skips weekends, saving time when preparing for consistent writing workflows.

---

## Features
- Creates folder structure: `path/year/month`
- Skips weekends (Saturday and Sunday)
- Generates markdown files named: `YYYY-MM-DD-XYZ.md`
- Includes predefined front matter and header in each file

---

## File Template Example
```markdown
---
layout: post
title:  ""
date:   YYYY-MM-DD 00:00:00 -0600
categories: ["Posts"] 
---

# 
```

---

## Usage
### 1. Run from Command Line
```bash
python template_generator.py /your/path 2025 3
```
- `/your/path` — Base directory where folders/files will be created
- `2025` — Year (e.g., 2025)
- `3` — Month (1-12)

### 2. Output
- Creates: `/your/path/2025/03/2025-03-DD-XYZ.md` (only on weekdays)

---

## Requirements
- Python 3.6+

No external libraries needed — uses standard Python modules.

---

## Example
```bash
python template_generator.py ./content 2025 3
```
**Result:**
```
./content/2025/03/2025-03-03-XYZ.md
./content/2025/03/2025-03-04-XYZ.md
...
```

---

## License
MIT License

---

## Author
[Your Name]
