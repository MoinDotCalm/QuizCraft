
import React, { useState } from 'react';
import InputSection from './components/InputSection';
import OutputSection from './components/OutputSection';
import QuizGenerator from './components/QuizGenerator';
import { generateLongSummary, generateMCQs, generateFIBs } from './utility/aiModels';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function App() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [mcqs, setMcqs] = useState([]);
  const [fibs, setFibs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type === "text/plain") {
      const text = await file.text();
      setInputText(text);
    } else if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        const typedArray = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let text = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          text += strings.join(' ') + '\n';
        }

        setInputText(text);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Unsupported file type. Please upload a .txt or .pdf file.");
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return alert('Please enter some text.');
    setLoading(true);
    try {
      const sum = await generateLongSummary(inputText);
      const questions = await generateMCQs(inputText);
      const blanks = await generateFIBs(inputText);
      setSummary(sum);
      setMcqs(questions);
      setFibs(blanks);
    } catch (err) {
      alert('Error generating content: ' + err.message);
    }
    setLoading(false);
  };

const handleExportPDF = async () => {
  const input = document.getElementById('quiz-content');
  const exportButton = document.querySelector('.pdf-button');

  exportButton.style.display = 'none';

  await new Promise((resolve) => setTimeout(resolve, 100));

  const pdf = new jsPDF('p', 'pt', 'a4');
  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true,
    scrollY: -window.scrollY,
  });

  const imgData = canvas.toDataURL('image/png');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 30;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const totalPages = Math.ceil(imgHeight / usableHeight);

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();
    const pageCanvas = document.createElement('canvas');
    const ctx = pageCanvas.getContext('2d');
    pageCanvas.width = canvas.width;
    pageCanvas.height = (usableHeight * canvas.width) / usableWidth;
    ctx.drawImage(canvas, 0, i * pageCanvas.height, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
    const croppedImg = pageCanvas.toDataURL('image/png');
    pdf.addImage(croppedImg, 'PNG', margin, margin, usableWidth, usableHeight);
  }

  pdf.save('quiz_summary.pdf');

  exportButton.style.display = 'inline-block';
};

  return (
    <div className="app-layout">
     
      <aside className="sidebar">
  <h2 className="sidebar-title"> 🤖 AI Powered</h2>
  <nav className="sidebar-nav">
    <a href="#input">📝 Input</a>
    <a href="#summary">📄 Summary</a>
    <a href="#mcqs">❓ Questions</a>
    <a href="#export">📥 Export</a>
  </nav>
</aside>

      <div className="main-wrapper">
        <header className="topbar">🧠 QuizCraft</header>
        <main className="content-area">
          <h3 id="input">Input Text</h3>
          <InputSection inputText={inputText} setInputText={setInputText} handleFileUpload={handleFileUpload} />
          <button onClick={handleGenerate} disabled={loading} className="generate-button">
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
          <div id="quiz-content">
  <section id="summary">
    <OutputSection summary={summary} />
  </section>
  <section id="mcqs">
  
    <QuizGenerator mcqs={mcqs} fibs={fibs} />
  </section>
  <div id="export">
    {summary && (
      <button onClick={handleExportPDF} className="pdf-button">
        Export as PDF
      </button>
    )}
  </div>
</div>

          
        </main>
        <footer className="footer">🚀 Developed by MoinDotCalm</footer>
      </div>
    </div>
  );
}
