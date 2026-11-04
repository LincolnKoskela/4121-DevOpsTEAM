from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table
from reportlab.lib.styles import getSampleStyleSheet
import io, json, logging
 
logger = logging.getLogger("postmortem")
 
def generate_postmortem(incident: dict, events: list, runbooks: list) -> bytes:
    """Generate a post-mortem PDF — returns bytes, no subprocess needed."""
    buffer = io.BytesIO()
    doc    = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story  = []
    logger.info(f"Generating post-mortem for incident {incident['id']}")
    story.append(Paragraph(f"Post-Mortem: {incident['title']}", styles['Title']))
    story.append(Paragraph(f"Priority: {incident['priority']}  |  Status: {incident['status']}", styles['Normal']))
    doc.build(story)
    return buffer.getvalue()
