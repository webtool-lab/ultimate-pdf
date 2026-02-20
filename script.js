async function mergePDFs() {
  const files = document.getElementById('mergeFiles').files;

  if (files.length < 2) {
    alert("Please select at least 2 PDF files");
    return;
  }

  const mergedPdf = await PDFLib.PDFDocument.create();

  for (let file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach(page => mergedPdf.addPage(page));
  }

  const pdfBytes = await mergedPdf.save();
  saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "merged.pdf");
}
async function splitPDF() {
  const file = document.getElementById('splitFile').files[0];
  const pageInput = document.getElementById('pageNumbers').value;

  if (!file || !pageInput) {
    alert("Please select a PDF and enter page numbers");
    return;
  }

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
  const newPdf = await PDFLib.PDFDocument.create();

  const totalPages = pdfDoc.getPageCount();
  let pages = [];

  if (pageInput.includes('-')) {
    let [start, end] = pageInput.split('-').map(n => parseInt(n) - 1);
    for (let i = start; i <= end && i < totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages = pageInput.split(',').map(n => parseInt(n) - 1);
  }

  const copiedPages = await newPdf.copyPages(pdfDoc, pages);
  copiedPages.forEach(p => newPdf.addPage(p));

  const newPdfBytes = await newPdf.save();
  saveAs(new Blob([newPdfBytes], { type: "application/pdf" }), "split.pdf");
}
async function compressPDF() {
  const file = document.getElementById('compressFile').files[0];

  if (!file) {
    alert("Please select a PDF file");
    return;
  }

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

  // Remove metadata for extra compression
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords("");
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");
  pdfDoc.setCreationDate(undefined);
  pdfDoc.setModificationDate(undefined);

  // Save with maximum compression options
  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    compress: true,
    addDefaultPage: false,
    objectsPerTick: 1 // force more granular object stream compression
  });

  saveAs(
    new Blob([compressedBytes], { type: "application/pdf" }),
    "compressed.pdf"
  );
}
async function rotatePDF() {
  const file = document.getElementById('rotateFile').files[0];
  const angle = parseInt(document.getElementById('rotationAngle').value);

  if (!file) {
    alert("Please select a PDF");
    return;
  }

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

  pdfDoc.getPages().forEach(page => {
    page.setRotation(PDFLib.degrees(angle));
  });

  const rotatedBytes = await pdfDoc.save();
  saveAs(new Blob([rotatedBytes], { type: "application/pdf" }), "rotated.pdf");
}
async function imagesToPDF() {
  const files = document.getElementById('imageFiles').files;

  if (files.length === 0) {
    alert("Please select image files");
    return;
  }

  const pdfDoc = await PDFLib.PDFDocument.create();

  for (let file of files) {
    const imgBytes = await file.arrayBuffer();
    let image;

    if (file.type === "image/jpeg") {
      image = await pdfDoc.embedJpg(imgBytes);
    } else {
      image = await pdfDoc.embedPng(imgBytes);
    }

    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height
    });
  }

  const pdfBytes = await pdfDoc.save();
  saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "images.pdf");
}
async function removePages() {
  const file = document.getElementById('removeFile').files[0];
  const input = document.getElementById('removePages').value;

  if (!file || !input) {
    alert("Please select a PDF and enter pages");
    return;
  }

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
  const newPdf = await PDFLib.PDFDocument.create();

  const totalPages = pdfDoc.getPageCount();
  let remove = new Set();

  if (input.includes('-')) {
    let [s, e] = input.split('-').map(n => parseInt(n) - 1);
    for (let i = s; i <= e; i++) remove.add(i);
  } else {
    input.split(',').forEach(n => remove.add(parseInt(n) - 1));
  }

  for (let i = 0; i < totalPages; i++) {
    if (!remove.has(i)) {
      const [page] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(page);
    }
  }

  const newBytes = await newPdf.save();
  saveAs(new Blob([newBytes], { type: "application/pdf" }), "pages_removed.pdf");
}
async function reorderPDF() {
  const file = document.getElementById('reorderFile').files[0];
  const orderInput = document.getElementById('pageOrder').value;

  if (!file || !orderInput) {
    alert("Please select a PDF and enter page order");
    return;
  }

  const order = orderInput.split(',').map(n => parseInt(n) - 1);

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
  const newPdf = await PDFLib.PDFDocument.create();

  const totalPages = pdfDoc.getPageCount();

  for (let i of order) {
    if (i >= 0 && i < totalPages) {
      const [page] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(page);
    }
  }

  const newBytes = await newPdf.save();
  saveAs(new Blob([newBytes], { type: "application/pdf" }), "reordered.pdf");
}
async function viewPDF() {
  const file = document.getElementById('viewFile').files[0];
  const viewer = document.getElementById('pdfViewer');

  if (!file) {
    alert("Please select a PDF file");
    return;
  }

  viewer.innerHTML = "";

  const fileURL = URL.createObjectURL(file);

  const pdf = await pdfjsLib.getDocument(fileURL).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    viewer.appendChild(canvas);
  }
}
async function openPDFViewer() {
  const file = document.getElementById('viewFile').files[0];
  const viewer = document.getElementById('pdfViewer');
  const modal = document.getElementById('pdfModal');

  if (!file) {
    alert("Please select a PDF file");
    return;
  }

  viewer.innerHTML = "";
  modal.style.display = "block";

  const fileURL = URL.createObjectURL(file);
  const pdf = await pdfjsLib.getDocument(fileURL).promise;

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.6 });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    viewer.appendChild(canvas);
  }
}

function closePDFViewer() {
  document.getElementById('pdfModal').style.display = "none";
  document.getElementById('pdfViewer').innerHTML = "";
}
async function addWatermark() {
  const file = document.getElementById('watermarkFile').files[0];
  const text = document.getElementById('watermarkText').value;

  if (!file || !text) {
    alert("Please select a PDF and enter watermark text");
    return;
  }

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

  pages.forEach(page => {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 4,
      y: height / 2,
      size: 40,
      font,
      color: PDFLib.rgb(0.75, 0.75, 0.75),
      rotate: PDFLib.degrees(45),
      opacity: 0.4
    });
  });

  const newBytes = await pdfDoc.save();
  saveAs(new Blob([newBytes], { type: "application/pdf" }), "watermarked.pdf");
}
async function addPageNumbers() {
  const file = document.getElementById('pageNumberFile').files[0];
  const position = document.getElementById('pageNumberPosition').value;

  if (!file) {
    alert("Please select a PDF file");
    return;
  }

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const text = `${index + 1}`; // ONLY number

    let x = width / 2;
    let y = 20;

    switch (position) {
      case "bottom-center":
        x = width / 2 - 5;
        y = 20;
        break;

      case "bottom-right":
        x = width - 40;
        y = 20;
        break;

      case "bottom-left":
        x = 20;
        y = 20;
        break;

      case "top-center":
        x = width / 2 - 5;
        y = height - 30;
        break;

      case "top-right":
        x = width - 40;
        y = height - 30;
        break;

      case "top-left":
        x = 20;
        y = height - 30;
        break;
    }

    page.drawText(text, {
      x,
      y,
      size: 12,
      font,
      color: PDFLib.rgb(0.3, 0.3, 0.3)
    });
  });

  const newBytes = await pdfDoc.save();
  saveAs(new Blob([newBytes], { type: "application/pdf" }), "page_numbers.pdf");
}
async function addSignature() {
  const pdfFile = document.getElementById('signPdfFile').files[0];
  const imgFile = document.getElementById('signImageFile').files[0];
  const position = document.getElementById('signPosition').value;

  if (!pdfFile || !imgFile) {
    alert("Please select a PDF and a signature image");
    return;
  }

  const pdfBytes = await pdfFile.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

  const imageBytes = await imgFile.arrayBuffer();
  let signatureImage;

  if (imgFile.type === "image/png") {
    signatureImage = await pdfDoc.embedPng(imageBytes);
  } else {
    signatureImage = await pdfDoc.embedJpg(imageBytes);
  }

  const firstPage = pdfDoc.getPages()[0];
  const { width, height } = firstPage.getSize();

  const sigWidth = 150;
  const sigHeight = (signatureImage.height / signatureImage.width) * sigWidth;

  let x = 20;
  let y = 20;

  switch (position) {
    case "bottom-right":
      x = width - sigWidth - 20;
      y = 20;
      break;

    case "bottom-left":
      x = 20;
      y = 20;
      break;

    case "top-right":
      x = width - sigWidth - 20;
      y = height - sigHeight - 20;
      break;

    case "top-left":
      x = 20;
      y = height - sigHeight - 20;
      break;
  }

  firstPage.drawImage(signatureImage, {
    x,
    y,
    width: sigWidth,
    height: sigHeight
  });

  const newBytes = await pdfDoc.save();
  saveAs(
    new Blob([newBytes], { type: "application/pdf" }),
    "signed.pdf"
  );
}
async function deletePages() {
  const file = document.getElementById('deletePdfFile').files[0];
  const pagesInput = document.getElementById('deletePagesInput').value;

  if (!file || !pagesInput) {
    alert("Please select PDF and pages");
    return;
  }

  const pagesToDelete = pagesInput
    .split(',')
    .map(p => parseInt(p.trim()) - 1);

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

  const totalPages = pdfDoc.getPageCount();

  for (let i = totalPages - 1; i >= 0; i--) {
    if (pagesToDelete.includes(i)) {
      pdfDoc.removePage(i);
    }
  }

  const newPdf = await pdfDoc.save();
  saveAs(new Blob([newPdf], { type: "application/pdf" }), "pages_deleted.pdf");
}
async function reorderPages() {
  const file = document.getElementById('reorderPdfFile').files[0];
  const orderInput = document.getElementById('pageOrderInput').value;

  if (!file || !orderInput) {
    alert("Please select PDF and page order");
    return;
  }

  const order = orderInput
    .split(',')
    .map(n => parseInt(n.trim()) - 1);

  const pdfBytes = await file.arrayBuffer();
  const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);

  const newPdf = await PDFLib.PDFDocument.create();
  const pages = await newPdf.copyPages(pdfDoc, order);

  pages.forEach(page => newPdf.addPage(page));

  const newBytes = await newPdf.save();
  saveAs(new Blob([newBytes], { type: "application/pdf" }), "reordered.pdf");
}

function toggleToolMenu() {
  const btn = document.getElementById('toolMenuBtn');
  const dd = document.getElementById('toolMenuDropdown');
  if (!dd) return;
  const isOpen = dd.classList.contains('open');
  dd.classList.toggle('open', !isOpen);
  dd.setAttribute('aria-hidden', String(isOpen));
  if (btn) btn.setAttribute('aria-expanded', String(!isOpen));
}

// Helper to find nearest anchor from an event (handles text nodes)
function _getAnchorFromEvent(e) {
  let node = e.target;
  // If a text node or non-element was clicked, walk up to the nearest element
  while (node && node.nodeType !== 1) node = node.parentNode;
  return node ? node.closest('a') : null;
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  const btn = document.getElementById('toolMenuBtn');
  const dd = document.getElementById('toolMenuDropdown');
  if (!dd) return;
  if (btn && (btn.contains(e.target) || dd.contains(e.target))) return;
  if (dd.classList.contains('open')) {
    dd.classList.remove('open');
    dd.setAttribute('aria-hidden', 'true');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
});

// Ensure a tool menu exists and is placed in the right corner of the nav on every page
function placeToolMenuRight() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  // If menu already exists (from index or previous markup), move it inside nav-links
  const existingBtn = document.getElementById('toolMenuBtn');
  const existingDd = document.getElementById('toolMenuDropdown');

  if (existingBtn) {
    // Prevent duplicating
    let li = existingBtn.closest('.menu-li');
    if (!li) {
      li = document.createElement('li');
      li.className = 'menu-li';
      // move button and dropdown under the li
      li.appendChild(existingBtn);
      if (existingDd) li.appendChild(existingDd);
      navLinks.appendChild(li);

      // Ensure links inside the moved dropdown navigate properly
      if (existingDd && !existingDd.dataset.hasLinkHandler) {
        existingDd.addEventListener('click', (e) => {
          const a = _getAnchorFromEvent(e);
          if (!a) return;
          // close dropdown for cleanliness
          existingDd.classList.remove('open');
          existingDd.setAttribute('aria-hidden', 'true');
          if (existingBtn) existingBtn.setAttribute('aria-expanded', 'false');
          window.location.href = a.href;
        });
        existingDd.dataset.hasLinkHandler = '1';
      }

    } else {
      // ensure it's appended to navLinks so it sits to the right
      navLinks.appendChild(li);

      // Also ensure existing dropdown links navigate correctly
      const movedDd = existingBtn.closest('.menu-li') ? existingBtn.closest('.menu-li').querySelector('#toolMenuDropdown') : null;
      if (movedDd && !movedDd.dataset.hasLinkHandler) {
        movedDd.addEventListener('click', (e) => {
          const a = _getAnchorFromEvent(e);
          if (!a) return;
          movedDd.classList.remove('open');
          movedDd.setAttribute('aria-hidden', 'true');
          if (existingBtn) existingBtn.setAttribute('aria-expanded', 'false');
          window.location.href = a.href;
        });
        movedDd.dataset.hasLinkHandler = '1';
      }
    }
    return;
  }

  // Otherwise, create the button and dropdown and append
  const li = document.createElement('li');
  li.className = 'menu-li';

  const btn = document.createElement('button');
  btn.id = 'toolMenuBtn';
  btn.className = 'tool-menu';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', 'Open tools menu');
  btn.onclick = toggleToolMenu;

  btn.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';

  const dd = document.createElement('div');
  dd.id = 'toolMenuDropdown';
  dd.className = 'tool-menu-dropdown';
  dd.setAttribute('aria-hidden', 'true');
  dd.innerHTML = `
    <a href="merge.html">Merge PDF</a>
    <a href="split.html">Split PDF</a>
    <a href="compress.html">Compress PDF</a>
    <a href="rotate.html">Rotate PDF</a>
    <a href="images-to-pdf.html">Images to PDF</a>
    <a href="delete-pages.html">Delete Pages</a>
    <a href="reorder-pages.html">Reorder Pages</a>
    <a href="reader.html">PDF Reader</a>
    <a href="watermark.html">Watermark PDF</a>
    <a href="page-numbers.html">Add Page Numbers</a>
    <a href="signature.html">Add Signature</a>
  `;

  li.appendChild(btn);
  li.appendChild(dd);
  navLinks.appendChild(li);

  // Ensure links inside the new dropdown always navigate and close the menu
  if (!dd.dataset.hasLinkHandler) {
    dd.addEventListener('click', (e) => {
      const a = _getAnchorFromEvent(e);
      if (!a) return;
      dd.classList.remove('open');
      dd.setAttribute('aria-hidden', 'true');
      const btnEl = document.getElementById('toolMenuBtn');
      if (btnEl) btnEl.setAttribute('aria-expanded', 'false');
      window.location.href = a.href;
    });
    dd.dataset.hasLinkHandler = '1';
  }
}

// Tool menu placement disabled (hamburger removed)
// Menu auto-placement intentionally disabled to remove top-right hamburger icon.

// If you later want to re-enable the tool menu, restore the DOMContentLoaded listener and call to placeToolMenuRight().

// Initialize styled file upload controls: show selected file name(s)
function initFileUploads() {
  document.querySelectorAll('.file-upload input[type="file"]').forEach(input => {
    const nameEl = input.parentElement.querySelector('.file-name');
    // set initial text
    if (nameEl) nameEl.textContent = input.multiple ? 'No files chosen' : 'No file chosen';

    input.addEventListener('change', () => {
      if (!input.files || input.files.length === 0) {
        if (nameEl) nameEl.textContent = input.multiple ? 'No files chosen' : 'No file chosen';
        return;
      }
      if (input.multiple) {
        if (nameEl) nameEl.textContent = input.files.length + ' files selected';
      } else {
        if (nameEl) nameEl.textContent = input.files[0].name;
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFileUploads);
} else {
  initFileUploads();
} 



