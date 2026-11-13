import io
import logging
from datetime import datetime
from html import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

logger = logging.getLogger("postmortem")


def safe(value):
    if value is None:
        return "N/A"
    return escape(str(value))


def generate_postmortem(
    incident: dict,
    events: list,
    runbooks: list
) -> bytes:

    buffer = io.BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    story = []

    story.append(
        Paragraph("INCIDENT POST-MORTEM REPORT", styles["Title"])
    )
    story.append(Spacer(1, 18))

    story.append(
        Paragraph(
            f"<b>Incident:</b> {safe(incident.get('title'))}",
            styles["Normal"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Incident ID:</b> {safe(incident.get('id'))}",
            styles["Normal"],
        )
    )

    story.append(Spacer(1, 12))

    details = [
        ["Field", "Value"],
        ["Priority", safe(incident.get("priority"))],
        ["Status", safe(incident.get("status"))],
        ["Declared By", safe(incident.get("declared_by"))],
        ["Declared At", safe(incident.get("declared_at"))],
        ["Resolved At", safe(incident.get("resolved_at"))],
        ["Escalated At", safe(incident.get("escalation_sent_at"))],
    ]

    table = Table(details, colWidths=[125, 370])

    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17365D")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
        ])
    )

    story.append(table)
    story.append(Spacer(1, 18))

    story.append(Paragraph("Incident Description", styles["Heading2"]))
    story.append(
        Paragraph(
            safe(incident.get("description")),
            styles["BodyText"],
        )
    )

    story.append(Spacer(1, 14))
    story.append(Paragraph("Incident Events", styles["Heading2"]))

    if events:
        for event in events:
            story.append(
                Paragraph(
                    safe(event),
                    styles["BodyText"],
                )
            )
            story.append(Spacer(1, 5))
    else:
        story.append(
            Paragraph("No events recorded.", styles["Normal"])
        )

    story.append(Spacer(1, 14))
    story.append(Paragraph("Runbook Activities", styles["Heading2"]))

    if runbooks:
        for runbook in runbooks:
            story.append(
                Paragraph(
                    safe(runbook),
                    styles["BodyText"],
                )
            )
            story.append(Spacer(1, 5))
    else:
        story.append(
            Paragraph("No runbook activities recorded.", styles["Normal"])
        )

    story.append(Spacer(1, 20))
    story.append(
        Paragraph(
            f"Report generated: {datetime.now().astimezone().isoformat(timespec='seconds')}",
            styles["Normal"],
        )
    )

    document.build(story)

    logger.info(
        "Generated post-mortem PDF for incident %s",
        incident.get("id"),
    )

    return buffer.getvalue()
