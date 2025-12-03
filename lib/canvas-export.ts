import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from "file-saver"

export async function exportToPDF(element: HTMLElement, filename: string) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false
  })

  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  })

  const imgWidth = 210 // A4 width in mm
  const pageHeight = 297 // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}

export async function exportToWord(content: string, filename: string) {
  // Parse HTML content into plain text (basic implementation)
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = content
  const textContent = tempDiv.textContent || ""

  // Split by paragraphs
  const paragraphs = textContent.split("\n\n").filter(p => p.trim())

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.map(
          para =>
            new Paragraph({
              children: [
                new TextRun({
                  text: para,
                  font: "Calibri",
                  size: 24 // 12pt
                })
              ]
            })
        )
      }
    ]
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}

export function copyToClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed"
    textArea.style.left = "-999999px"
    textArea.style.top = "-999999px"
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand("copy")
      textArea.remove()
      return Promise.resolve()
    } catch (err) {
      textArea.remove()
      return Promise.reject(err)
    }
  }
}
