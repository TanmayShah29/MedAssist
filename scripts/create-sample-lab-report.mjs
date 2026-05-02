import fs from "node:fs";
import path from "node:path";

const outputPath = path.join(process.cwd(), "public", "samples", "sample-report.pdf");

const pages = [
  [
    "MEDASSIST SAMPLE DIAGNOSTICS",
    "Comprehensive Wellness Panel",
    "",
    "Patient: Alex Morgan",
    "DOB: 1991-04-18",
    "Sex: Female",
    "Collected: 2026-04-24",
    "Reported: 2026-04-25",
    "Ordering clinician: Sample Provider, MD",
    "",
    "This is a synthetic sample report for testing MedAssist. It is not real patient data.",
    "",
    "COMPLETE BLOOD COUNT",
    "Test                         Result      Unit        Reference Range      Flag",
    "Hemoglobin                   11.2        g/dL        12.0 - 15.5          Low",
    "Hematocrit                   34.1        %           36.0 - 46.0          Low",
    "RBC Count                    3.92        x10^6/uL    4.10 - 5.10          Low",
    "WBC Count                    7.4         x10^3/uL    4.0 - 11.0           Normal",
    "Platelets                    278         x10^3/uL    150 - 450            Normal",
    "MCV                          87          fL          80 - 100             Normal",
    "MCH                          28.6        pg          27.0 - 33.0          Normal",
    "",
    "METABOLIC PANEL",
    "Test                         Result      Unit        Reference Range      Flag",
    "Fasting Glucose              108         mg/dL       70 - 99              High",
    "HbA1c                        5.8         %           4.0 - 5.6            High",
    "Creatinine                   0.82        mg/dL       0.57 - 1.00          Normal",
    "eGFR                         94          mL/min/1.73m2 >= 60              Normal",
    "ALT                          28          U/L         7 - 35               Normal",
    "AST                          24          U/L         8 - 33               Normal",
  ],
  [
    "MEDASSIST SAMPLE DIAGNOSTICS",
    "Comprehensive Wellness Panel - Page 2",
    "",
    "LIPID PANEL",
    "Test                         Result      Unit        Reference Range      Flag",
    "Total Cholesterol            218         mg/dL       < 200                High",
    "LDL Cholesterol              142         mg/dL       < 100                High",
    "HDL Cholesterol              49          mg/dL       >= 50                Borderline Low",
    "Triglycerides                176         mg/dL       < 150                High",
    "Non-HDL Cholesterol          169         mg/dL       < 130                High",
    "",
    "VITAMINS, IRON, AND INFLAMMATION",
    "Test                         Result      Unit        Reference Range      Flag",
    "Vitamin D 25-OH              22          ng/mL       30 - 100             Low",
    "Vitamin B12                  318         pg/mL       232 - 1245           Normal",
    "Ferritin                     18          ng/mL       15 - 150             Borderline Low",
    "Iron                         48          ug/dL       50 - 170             Low",
    "C-Reactive Protein           4.8         mg/L        < 3.0                High",
    "",
    "THYROID",
    "Test                         Result      Unit        Reference Range      Flag",
    "TSH                          3.9         uIU/mL      0.45 - 4.50          Normal",
    "Free T4                      1.1         ng/dL       0.8 - 1.8            Normal",
    "",
    "PATIENT NOTES",
    "Reported symptoms: fatigue, trouble sleeping, occasional dizziness.",
    "Clinical note: Values should be reviewed with a licensed clinician.",
    "End of synthetic sample report.",
  ],
];

function escapePdfText(value) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function pageContent(lines) {
  const commands = ["BT", "/F1 10 Tf", "50 790 Td", "14 TL"];
  lines.forEach((line, index) => {
    if (index > 0) commands.push("T*");
    commands.push(`(${escapePdfText(line)}) Tj`);
  });
  commands.push("ET");
  return `${commands.join("\n")}\n`;
}

const objects = [];

function addObject(body) {
  objects.push(body);
  return objects.length;
}

const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
const pagesId = addObject("");
const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

const pageIds = [];

for (const lines of pages) {
  const content = pageContent(lines);
  const contentId = addObject(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}endstream`);
  const pageId = addObject(
    `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`
  );
  pageIds.push(pageId);
}

objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

let pdf = "%PDF-1.7\n";
const offsets = [0];

objects.forEach((body, index) => {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
});

const xrefOffset = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += "0000000000 65535 f \n";
for (let i = 1; i < offsets.length; i += 1) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, pdf);
console.log(`Created ${outputPath}`);
