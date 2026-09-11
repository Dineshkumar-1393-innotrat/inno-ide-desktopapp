import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "InnoIDE Desktop — ESP32 Flashing & Toolchain Detection Technical Guide")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)

        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 40, page_text)
        self.drawString(54, 40, "Confidential & Proprietary — Innotrat Labs")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 52, 558, 52)
        self.restoreState()

def generate_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=64,
        bottomMargin=64
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1e40af")   # Deep Blue
    accent_color = colors.HexColor("#2563eb")    # Royal Blue
    dark_neutral = colors.HexColor("#0f172a")    # Slate 900
    text_color = colors.HexColor("#334155")      # Slate 700
    bg_light = colors.HexColor("#f8fafc")        # Slate 50
    code_bg = colors.HexColor("#0f172a")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=text_color,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=text_color,
        leftIndent=15,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#38bdf8"),
        spaceAfter=0
    )

    callout_style = ParagraphStyle(
        'Callout_Text',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#1e3a8a")
    )

    elements = []

    # --- Title Banner Block ---
    banner_data = [
        [
            Paragraph("<b>INNOIDE DESKTOP PLATFORM</b><br/><font size='16'><b>ESP32 Hardware Flashing & Toolchain Detection Guide</b></font><br/><font size='9' color='#93c5fd'>Complete Technical Reference: Device Verification & ESP-IDF Setup Workflows</font>", ParagraphStyle('BannerText', textColor=colors.white, fontName='Helvetica', leading=18))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[504])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), primary_color),
        ('PADDING', (0, 0), (-1, -1), 14),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 14),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    elements.append(banner_table)
    elements.append(Spacer(1, 12))

    # Meta table
    meta_data = [
        [
            Paragraph("<b>Document Version:</b> 2.4.0", body_style),
            Paragraph("<b>Date:</b> August 2026", body_style),
            Paragraph("<b>Target Target:</b> ESP32 / ESP32-S3", body_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[168, 168, 168])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    # --- Section 1: Executive Overview ---
    elements.append(Paragraph("1. Executive Summary & Problem Resolution", h1_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=accent_color, spaceAfter=8, spaceBefore=2))
    
    elements.append(Paragraph(
        "In earlier builds of the InnoIDE Desktop application, initiating a flash action without a physically connected ESP32 board resulted in an unvalidated execution attempt (relying on mock COM ports or simulated timers). This document details the <b>two-stage hardware guard and environment detection architecture</b> implemented to guarantee safety and clarity for developers.",
        body_style
    ))

    # Key Changes Box
    callout_data = [
        [
            Paragraph(
                "<b>Key Architectural Safeguards Implemented:</b><br/>"
                "• <b>Hardware Detection Guard:</b> Flashing is strictly blocked until a valid USB COM port is verified.<br/>"
                "• <b>Toolchain Verification Engine:</b> Proactively checks if the ESP-IDF framework is installed on the host OS.<br/>"
                "• <b>First-Time User Prompt Modal:</b> Automatically presents an onboarding dialog prompting the user to install ESP-IDF (with 1-click browser redirection) or skip to the next steps.",
                callout_style
            )
        ]
    ]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#eff6ff")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#bfdbfe")),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(callout_table)
    elements.append(Spacer(1, 12))

    # --- Section 2: Hardware Device Detection ---
    elements.append(Paragraph("2. Real-Time Device Discovery & Validation Guard", h1_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=accent_color, spaceAfter=8, spaceBefore=2))

    elements.append(Paragraph(
        "To prevent phantom flash executions, all hardcoded mock devices (<code>esp32-dev-1</code>, <code>COM3</code>, <code>COM7</code>) were removed. The UI and Electron backend now enforce strict physical verification:",
        body_style
    ))

    elements.append(Paragraph("• <b>Native Port Enumeration:</b> Electron's <code>serial.service.js</code> queries Windows WMI (<code>Win32_SerialPort</code>) and <code>serialport.list()</code> to detect genuine USB devices.", bullet_style))
    elements.append(Paragraph("• <b>Empty-State Handling:</b> When 0 devices are attached, the wizard displays a dedicated warning card with instructions to connect via USB.", bullet_style))
    elements.append(Paragraph("• <b>Button Interlocks:</b> The <i>'Continue →'</i> and <i>'Start Flash'</i> buttons are hard-disabled until an active device is selected.", bullet_style))
    elements.append(Paragraph("• <b>Backend Enforcement:</b> <code>flash.service.js</code> throws a fatal error if <code>freshPorts.length === 0</code>, stopping subprocess spawning before compilation starts.", bullet_style))
    elements.append(Spacer(1, 10))

    # Code snippet block for Device Detection
    code_text = (
        "// ESP32Flasher.jsx - Pre-flash Guard<br/>"
        "const handleStartFlash = async () =&gt; {<br/>"
        "&nbsp;&nbsp;if (!selectedDevice || !selectedDevice.port) {<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;toast({ title: 'No Device Connected', status: 'warning' });<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;setWizardStep('devices');<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;return;<br/>"
        "&nbsp;&nbsp;}<br/>"
        "&nbsp;&nbsp;// Only triggers electronAPI.flash.runPipeline when selectedDevice exists<br/>"
        "};"
    )
    code_data = [[Paragraph(code_text, code_style)]]
    code_table = Table(code_data, colWidths=[504])
    code_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    elements.append(code_table)
    elements.append(Spacer(1, 14))

    # --- Section 3: ESP-IDF Detection Engine ---
    elements.append(Paragraph("3. ESP-IDF Toolchain Detection Engine", h1_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=accent_color, spaceAfter=8, spaceBefore=2))

    elements.append(Paragraph(
        "The InnoIDE detection engine inspects multiple storage locations to determine if ESP-IDF is installed on the host system without requiring manual PATH exports by the user:",
        body_style
    ))

    # Detection Paths Table
    paths_data = [
        [Paragraph("<b>Detection Target</b>", body_style), Paragraph("<b>Location / Path Checked</b>", body_style), Paragraph("<b>Verification Rule</b>", body_style)],
        [Paragraph("1. Saved Config", body_style), Paragraph("<code>flash_config.json (userData)</code>", body_style), Paragraph("Custom path configured by user", body_style)],
        [Paragraph("2. System ENV", body_style), Paragraph("<code>process.env.IDF_PATH</code>", body_style), Paragraph("Checked for active shell sessions", body_style)],
        [Paragraph("3. Standard Frameworks", body_style), Paragraph("<code>C:\\Espressif\\frameworks\\esp-idf-v5.*<br/>D:\\Espressif\\frameworks\\esp-idf-v5.*</code>", body_style), Paragraph("Dynamic scanning of Espressif directories", body_style)],
        [Paragraph("4. Root Drives", body_style), Paragraph("<code>D:\\ESP-IDF</code> or <code>C:\\esp-idf</code>", body_style), Paragraph("Checks <code>export.bat</code> and <code>tools/idf.py</code>", body_style)],
        [Paragraph("5. Home Directory", body_style), Paragraph("<code>%USERPROFILE%\\.espressif</code>", body_style), Paragraph("Scans python virtualenvs & tools", body_style)]
    ]
    paths_table = Table(paths_data, colWidths=[110, 214, 180])
    paths_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(paths_table)
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("<b>Tool Verification Checks:</b>", h2_style))
    elements.append(Paragraph("Once a candidate directory is located, <code>flashService.checkEnvironment()</code> verifies each tool:", body_style))
    elements.append(Paragraph("1. <b>Python Virtualenv:</b> Locates <code>IDF_PYTHON_ENV_PATH/Scripts/python.exe</code>", bullet_style))
    elements.append(Paragraph("2. <b>IDF CLI:</b> Verifies <code>idf.py --version</code> execution via <code>export.bat</code>", bullet_style))
    elements.append(Paragraph("3. <b>Build Systems:</b> Confirms <code>cmake --version</code> and <code>ninja --version</code> availability.", bullet_style))
    elements.append(Paragraph("4. <b>Flasher Utility:</b> Verifies <code>esptool.py</code> availability for serial writes.", bullet_style))
    elements.append(Spacer(1, 14))

    # --- Section 4: First-Time User Setup Modal ---
    elements.append(Paragraph("4. First-Time User Onboarding & Redirect Flow", h1_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=accent_color, spaceAfter=8, spaceBefore=2))

    elements.append(Paragraph(
        "When a user enters the Flasher modal on a freshly installed system, the app determines if toolchain onboarding is required:",
        body_style
    ))

    # Modal decision flow table
    decision_data = [
        [Paragraph("<b>User Action</b>", body_style), Paragraph("<b>Trigger / Event Handler</b>", body_style), Paragraph("<b>System Behavior</b>", body_style)],
        [
            Paragraph("<b>Click YES</b><br/>(Install ESP-IDF)", body_style),
            Paragraph("<code>handleInstallIdfYes()</code>", body_style),
            Paragraph("• Stores dismissal flag in <code>localStorage</code><br/>• Calls <code>shell.openExternal('https://dl.espressif.com/dl/esp-idf/')</code><br/>• Launches user's browser to official installer page", body_style)
        ],
        [
            Paragraph("<b>Click NO</b><br/>(Continue Step)", body_style),
            Paragraph("<code>handleInstallIdfNo()</code>", body_style),
            Paragraph("• Stores dismissal flag in <code>localStorage</code><br/>• Closes popup immediately<br/>• Allows developer to proceed through wizard", body_style)
        ],
        [
            Paragraph("<b>Manual Re-check</b><br/>(Header button)", body_style),
            Paragraph("<code>setIsIdfPromptOpen(true)</code>", body_style),
            Paragraph("• Clickable anytime from the Stepper Header<br/>• Re-opens installation guide and download links", body_style)
        ]
    ]
    decision_table = Table(decision_data, colWidths=[120, 160, 224])
    decision_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(decision_table)
    elements.append(Spacer(1, 14))

    # --- Section 5: Architecture Flow Diagram ---
    elements.append(Paragraph("5. Complete System Architecture & IPC Flow", h1_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=accent_color, spaceAfter=8, spaceBefore=2))

    diagram_text = (
        "[React: ESP32Flasher.jsx]<br/>"
        "&nbsp;&nbsp;|<br/>"
        "&nbsp;&nbsp;+-- 1. On Mount: ipcRenderer.invoke('flash:check-env')<br/>"
        "&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+-- If not installed --&gt; Open 'ESP-IDF Setup Modal'<br/>"
        "&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+-- 'YES' --&gt; ipcRenderer.invoke('app:open-external', URL)<br/>"
        "&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+-- 'NO'  --&gt; Dismiss &amp; continue<br/>"
        "&nbsp;&nbsp;|<br/>"
        "&nbsp;&nbsp;+-- 2. Step 2: ipcRenderer.invoke('flash:detect-ports')<br/>"
        "&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+-- If ports == 0 --&gt; Show 'No Device' card, disable 'Continue'<br/>"
        "&nbsp;&nbsp;|<br/>"
        "&nbsp;&nbsp;+-- 3. Step 3 &amp; 4: ipcRenderer.invoke('flash:run-pipeline', { port, target, code })<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+-- [Electron flash.service.js] --&gt; Spawns python flash_agent.py (IDF Build + Esptool)"
    )
    diagram_data = [[Paragraph(diagram_text, code_style)]]
    diagram_table = Table(diagram_data, colWidths=[504])
    diagram_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), code_bg),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    elements.append(diagram_table)
    elements.append(Spacer(1, 14))

    # --- Section 6: Source File Mapping ---
    elements.append(Paragraph("6. Key Source Files Modified & References", h1_style))
    elements.append(HRFlowable(width="100%", thickness=1, color=accent_color, spaceAfter=8, spaceBefore=2))

    files_data = [
        [Paragraph("<b>Component / File</b>", body_style), Paragraph("<b>Path</b>", body_style), Paragraph("<b>Key Responsibilities</b>", body_style)],
        [Paragraph("ESP32 Flasher UI", body_style), Paragraph("<code>src/components/ESP32Flasher.jsx</code>", body_style), Paragraph("Empty states, stepper controls, IDF prompt modal, Start Flash validation interlocks.", body_style)],
        [Paragraph("Flash Service", body_style), Paragraph("<code>electron/services/flash.service.js</code>", body_style), Paragraph("Filesystem IDF scanner, environment builder, port verification, subprocess orchestration.", body_style)],
        [Paragraph("Serial Service", body_style), Paragraph("<code>electron/services/serial.service.js</code>", body_style), Paragraph("WMI & serialport hardware query, port accessibility tester.", body_style)],
        [Paragraph("Electron IPC & Preload", body_style), Paragraph("<code>electron/ipc/index.js<br/>electron/preload.cjs</code>", body_style), Paragraph("<code>app:open-external</code> and <code>flash:check-env</code> bridge APIs.", body_style)]
    ]
    files_table = Table(files_data, colWidths=[120, 184, 200])
    files_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(files_table)

    # Build the document
    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {output_filename}")

if __name__ == "__main__":
    output_path = os.path.join(os.getcwd(), "InnoIDE_ESP32_Flashing_and_IDF_Detection_Guide.pdf")
    generate_pdf(output_path)
