import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function generateMoodPDF(
  userName: string,
  moods: any[],
  options: any
) {
  try {
    const pdf = new jsPDF();

    pdf.setFontSize(18);
    pdf.text("Mood Report", 20, 20);

    pdf.setFontSize(12);
    pdf.text(`User: ${userName}`, 20, 30);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 37);

    let y = 50;

    /* CHART */
    if (options.includeChart) {
      const chart = document.getElementById("mood-chart");

      if (chart) {
        await new Promise((r) => requestAnimationFrame(() => r(null)));


        const canvas = await html2canvas(chart, {
  scale: 2,
  useCORS: true,
});

        const imgData = canvas.toDataURL("image/jpeg", 0.9);

        pdf.text("Mood Analytics", 20, y);
        y += 10;

        pdf.addImage(imgData, "JPEG", 15, y, 180, 60);
        y += 75;
      }
    }

    /* ENTRIES */
    if (options.includeEntries) {
      pdf.text("Mood Entries", 20, y);
      y += 10;

      moods.forEach((m) => {
        pdf.text(`${m.mood} (Intensity: ${m.intensity})`, 20, y);
        y += 6;

        if (m.note) {
          pdf.setFontSize(10);
          pdf.text(`Note: ${m.note}`, 25, y);
          pdf.setFontSize(12);
          y += 6;
        }

        pdf.text(
          `Date: ${new Date(m.date).toLocaleDateString()}`,
          25,
          y
        );
        y += 10;
      });
    }

    pdf.save("mood-report.pdf");
  } catch (err) {
    console.error("PDF error:", err);
    alert("PDF generation failed");
  }
}
