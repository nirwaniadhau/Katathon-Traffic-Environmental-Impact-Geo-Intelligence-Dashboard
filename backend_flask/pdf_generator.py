from flask import Blueprint, request, send_file
# from playwright.async_api import async_playwright
import asyncio
import tempfile

pdf = Blueprint("pdf", __name__)

@pdf.route("/download-report", methods=["GET"])
def download_report():
    city = request.args.get("city")
    range_value = request.args.get("range")

    # IMPORTANT: use matching React port
    url = f"http://localhost:5173/pdf-view?city={city}&range={range_value}"

    pdf_path = asyncio.run(generate_pdf(url))

    return send_file(
        pdf_path,
        as_attachment=True,
        download_name=f"GeoSense-{city}.pdf",
        mimetype="application/pdf"
    )


async def generate_pdf(url):
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = temp_file.name

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto(url, wait_until="networkidle")

        await page.pdf(
            path=pdf_path,
            format="A4",
            print_background=True,
            margin={"top": "20mm", "bottom": "20mm", "left": "12mm", "right": "12mm"}
        )

        await browser.close()

    return pdf_path
