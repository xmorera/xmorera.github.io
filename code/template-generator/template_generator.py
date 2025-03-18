import os
import sys
from datetime import datetime, timedelta

import argparse

def is_weekend(date_obj):
    return date_obj.weekday() >= 5  # 5 = Saturday, 6 = Sunday

def create_template_files(base_path, year, month):
    year_str = str(year)
    month_str = f"{month:02d}"

    # Create year/month directories if they don't exist
    year_path = os.path.join(base_path, year_str)
    month_path = os.path.join(year_path, month_str)
    os.makedirs(month_path, exist_ok=True)

    # Determine the number of days in the given month
    first_day = datetime(year, month, 1)
    if month == 12:
        next_month = datetime(year + 1, 1, 1)
    else:
        next_month = datetime(year, month + 1, 1)
    delta = next_month - first_day

    for day in range(1, delta.days + 1):
        date_obj = datetime(year, month, day)
        if is_weekend(date_obj):
            continue  # Skip weekends

        date_str = date_obj.strftime("%Y-%m-%d")
        filename = f"{date_str}-XYZ.md"
        file_path = os.path.join(month_path, filename)

        if not os.path.exists(file_path):
            with open(file_path, 'w') as f:
                f.write(f"""---

layout: post
title:  ""
date:   {date_str} 00:00:00 -0600
categories: ["Posts"] 

---

# 
""")
            print(f"Created: {file_path}")
        else:
            print(f"Skipped (already exists): {file_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate writing templates.")
    parser.add_argument("path", type=str, help="Base path for templates")
    parser.add_argument("year", type=int, help="Year")
    parser.add_argument("month", type=int, help="Month (1-12)")

    args = parser.parse_args()
    create_template_files(args.path, args.year, args.month)
