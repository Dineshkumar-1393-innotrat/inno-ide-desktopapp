import os
import sys
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(40, 800, "InnoIDE Technical Report — ESP32 Firmware Flashing Pipeline")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(40, 792, 555, 792)
            
        # Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 30, page_str)
        self.drawString(40, 30, "CONFIDENTIAL & PROPRIETARY — INNOTRAT LABS")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 42, 555, 42)
        
        self.restoreState()

def build_pdf(filename="ESP32_Firmware_Flashing_Pipeline_Report.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=45,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#FFFFFF")
    )
    
    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#E0E7FF")
    )

    meta_style = ParagraphStyle(
        "CoverMeta",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#DBEAFE")
    )

    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=14,
        spaceAfter=6
    )

    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#1E40AF"),
        spaceBefore=10,
        spaceAfter=4
    )

    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        "BulletText",
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    code_style = ParagraphStyle(
        "CodeText",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#F8FAFC")
    )

    tbl_header_style = ParagraphStyle(
        "TblHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A")
    )

    tbl_body_style = ParagraphStyle(
        "TblBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#334155")
    )

    story = []

    # 1. Header Banner Table
    banner_content = [
        [Paragraph("ESP32 Firmware Flashing Pipeline", title_style)],
        [Paragraph("End-to-End Architecture, Toolchain Orchestration &amp; Dual-Stage Auto-Recovery", subtitle_style)],
        [Spacer(1, 4)],
        [Paragraph("<b>Platform:</b> InnoIDE Desktop (Electron / React) &nbsp;|&nbsp; <b>Engine:</b> Python <code>esptool</code> Direct Flash &nbsp;|&nbsp; <b>Targets:</b> ESP32 / S2 / S3 / C3 / C6", meta_style)]
    ]
    banner_table = Table(banner_content, colWidths=[515])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#1E3A8A")),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 2),
        ('TOPPADDING', (0, 1), (-1, 1), 0),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(banner_table)
    story.append(Spacer(1, 10))

    # 2. Executive Summary & Architecture
    story.append(Paragraph("1. Executive Summary &amp; Architecture Overview", h1_style))
    story.append(Paragraph(
        "The InnoIDE ESP32 Flashing Subsystem delivers a zero-configuration, resilient firmware build and flashing pipeline. "
        "It eliminates the need for developers to manually configure compiler paths, install external command-line tools, "
        "or operate within an ESP-IDF terminal shell.",
        body_style
    ))

    # 4-Pillar Grid Table
    arch_boxes = [
        [
            Paragraph("<b>1. React UI Wizard</b><br/><font color='#64748B' size=7.5><code>ESP32Flasher.jsx</code> provides step-by-step device discovery, port selection, real-time log streaming, and progress bars.</font>", body_style),
            Paragraph("<b>2. Electron IPC Bridge</b><br/><font color='#64748B' size=7.5><code>flash.service.js</code> auto-detects ESP-IDF paths, extracts authoritative env variables via <code>export.bat</code>, and prevents port lockups.</font>", body_style)
        ],
        [
            Paragraph("<b>3. Toolchain &amp; Build Engine</b><br/><font color='#64748B' size=7.5><code>flash_agent.py</code> writes C source code, provisions component manifests (e.g. <code>led_strip</code>), and runs Ninja compilation.</font>", body_style),
            Paragraph("<b>4. Hardware Flashing</b><br/><font color='#64748B' size=7.5>Direct invocation of <code>esptool.py</code> with <code>flasher_args.json</code> parameters, bypassing CMake bugs for reliable writes to flash memory.</font>", body_style)
        ]
    ]
    arch_table = Table(arch_boxes, colWidths=[252, 252])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 10))

    # 3. Stage-by-Stage Workflow
    story.append(Paragraph("2. End-to-End Flashing Workflow (Stage-by-Stage)", h1_style))
    
    story.append(Paragraph("Stage 1: Device Discovery &amp; Port Reservation", h2_style))
    story.append(Paragraph(
        "• <b>Hardware Port Scanning:</b> <code>serialService.listPorts()</code> discovers all active COM ports, automatically filtering for USB-UART chipsets (CP2102, CH340, FTDI, native ESP32-S3 USB CDC) and ignoring Bluetooth modems.<br/>"
        "• <b>Serial Monitor Guard:</b> Active terminal or monitor sessions on the selected COM port are automatically disconnected prior to flashing to prevent <code>Access Denied / Port Locked</code> conflicts on Windows.",
        bullet_style
    ))

    story.append(Paragraph("Stage 2: Dynamic ESP-IDF Environment Capture", h2_style))
    story.append(Paragraph(
        "• <b>Framework Auto-Detection:</b> Scans standard directories (<code>C:\\Espressif\\frameworks\\esp-idf-v5.x</code>, <code>D:\\Espressif\\...</code>, or custom user paths).<br/>"
        "• <b>Environment Variable Extraction:</b> Executes <code>cmd.exe /c call export.bat && set</code> in a child process to dynamically extract full compiler PATHs, <code>IDF_PATH</code>, and <code>IDF_PYTHON_ENV_PATH</code>.",
        bullet_style
    ))

    story.append(Paragraph("Stage 3: Source Code &amp; Component Manifest Generation", h2_style))
    story.append(Paragraph(
        "• <b>Source File Writing:</b> Generates <code>main/main.c</code> from the active Monaco editor or fetched firmware payload.<br/>"
        "• <b>Dependency Auto-Provisioning:</b> Checks source code for peripheral imports (e.g. <code>led_strip.h</code>) and automatically creates <code>main/idf_component.yml</code> with <code>espressif/led_strip: \"^3.0.0\"</code>.<br/>"
        "• <b>CMake Generation:</b> Generates <code>main/CMakeLists.txt</code> with dynamically linked component dependencies (<code>REQUIRES esp_driver_rmt esp_driver_gpio driver led_strip</code>).",
        bullet_style
    ))

    story.append(PageBreak())

    # Page 2: Compilation, esptool, and recovery
    story.append(Paragraph("3. Compilation &amp; esptool Binary Write", h1_style))
    story.append(Paragraph(
        "When the build command executes, <code>idf.py build</code> invokes CMake and Ninja to produce three critical binaries mapped by exact memory offsets:",
        body_style
    ))

    # Binary Table
    bin_data = [
        [Paragraph("Binary Component", tbl_header_style), Paragraph("Memory Offset", tbl_header_style), Paragraph("File Path", tbl_header_style), Paragraph("Function &amp; Role", tbl_header_style)],
        [Paragraph("<b>Bootloader</b>", tbl_body_style), Paragraph("<code>0x0</code> / <code>0x1000</code>", tbl_body_style), Paragraph("<code>build/bootloader/bootloader.bin</code>", tbl_body_style), Paragraph("Hardware initialization, clock setup &amp; partition validation", tbl_body_style)],
        [Paragraph("<b>Partition Table</b>", tbl_body_style), Paragraph("<code>0x8000</code>", tbl_body_style), Paragraph("<code>build/partition_table/partition-table.bin</code>", tbl_body_style), Paragraph("Maps NVS, PHY data, factory &amp; OTA app boundaries", tbl_body_style)],
        [Paragraph("<b>App Firmware</b>", tbl_body_style), Paragraph("<code>0x10000</code>", tbl_body_style), Paragraph("<code>build/ESP32_Firmware_Project.bin</code>", tbl_body_style), Paragraph("Compiled user C application code &amp; FreeRTOS tasks", tbl_body_style)]
    ]
    bin_table = Table(bin_data, colWidths=[90, 85, 175, 165])
    bin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(bin_table)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Direct esptool Execution Command:", h2_style))
    code_text = (
        "python.exe esptool.py --chip esp32s3 --port COM3 --baud 460800 \\\n"
        "  --before default_reset --after hard_reset write_flash \\\n"
        "  --flash_mode dio --flash_freq 80m --flash_size 2MB \\\n"
        "  0x0 build/bootloader/bootloader.bin \\\n"
        "  0x8000 build/partition_table/partition-table.bin \\\n"
        "  0x10000 build/ESP32_Firmware_Project.bin"
    )
    code_tbl = Table([[Paragraph(code_text.replace("\n", "<br/>"), code_style)]], colWidths=[515])
    code_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0F172A")),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#0F172A"))
    ]))
    story.append(code_tbl)
    story.append(Spacer(1, 10))

    # 4. Recovery Strategy
    story.append(Paragraph("4. Dual-Stage Auto-Recovery &amp; Bootloader Strategy", h1_style))
    story.append(Paragraph(
        "ESP32-S3 boards with native USB CDC or specific USB-UART bridges can occasionally fail automatic DTR/RTS reset toggling. "
        "The flashing subsystem incorporates an intelligent 2-attempt failover sequence:",
        body_style
    ))

    recovery_data = [
        [Paragraph("Attempt Mode", tbl_header_style), Paragraph("Baud Rate", tbl_header_style), Paragraph("Reset Mode", tbl_header_style), Paragraph("Workflow &amp; Recovery Action", tbl_header_style)],
        [
            Paragraph("<b>Attempt 1</b><br/><font color='#16A34A'>High-Speed</font>", tbl_body_style),
            Paragraph("<b>460,800 baud</b>", tbl_body_style),
            Paragraph("<code>default_reset</code>", tbl_body_style),
            Paragraph("Standard high-speed flashing using automated RTS/DTR pin toggle. Completed in under 10 seconds for typical firmware payloads.", tbl_body_style)
        ],
        [
            Paragraph("<b>Attempt 2</b><br/><font color='#D97706'>Manual Fallback</font>", tbl_body_style),
            Paragraph("<b>115,200 baud</b>", tbl_body_style),
            Paragraph("<code>no_reset</code>", tbl_body_style),
            Paragraph("Triggered automatically if auto-reset times out. UI instructs user: <i>'Hold BOOT (IO0) → Tap EN/RST → Release BOOT'</i> with a 5-second countdown to flash directly into ROM download mode.", tbl_body_style)
        ]
    ]
    recovery_table = Table(recovery_data, colWidths=[80, 80, 85, 270])
    recovery_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(recovery_table)
    story.append(Spacer(1, 10))

    # 5. UI Event Mapping
    story.append(Paragraph("5. Real-Time UI Feedback Synchronization", h1_style))
    ui_events = [
        [Paragraph("Pipeline Event", tbl_header_style), Paragraph("UI Progress", tbl_header_style), Paragraph("Status Text Displayed to User", tbl_header_style)],
        [Paragraph("<code>setting_target</code>", tbl_body_style), Paragraph("<b>20%</b>", tbl_body_style), Paragraph("Setting chip target esp32s3...", tbl_body_style)],
        [Paragraph("<code>building</code> / <code>build_stdout</code>", tbl_body_style), Paragraph("<b>45% – 75%</b>", tbl_body_style), Paragraph("Compiling firmware modules with ESP-IDF...", tbl_body_style)],
        [Paragraph("<code>flashing</code> / <code>flash_stdout</code>", tbl_body_style), Paragraph("<b>80% – 95%</b>", tbl_body_style), Paragraph("Writing sectors to Flash memory at 460800 baud...", tbl_body_style)],
        [Paragraph("<code>flash_success</code>", tbl_body_style), Paragraph("<b>100%</b>", tbl_body_style), Paragraph("Firmware successfully written &amp; verified! (Transitions to Success screen)", tbl_body_style)]
    ]
    ui_table = Table(ui_events, colWidths=[140, 75, 300])
    ui_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(ui_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF: {os.path.abspath(filename)}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "ESP32_Firmware_Flashing_Pipeline_Report.pdf"
    build_pdf(out_file)
