import React from 'react';

export default function InputSection({ inputText, setInputText, handleFileUpload }) {
  return (
    <div>
      <textarea
        rows={6}
        style={{ width: '100%', fontSize: '16px' }}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Paste or type article/text here..."
      />
      <div style={{ marginTop: '10px' }}>
        <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} />
        <p style={{ fontSize: '14px', color: 'gray' }}>Upload .txt or .pdf file</p>
      </div>
    </div>
  );
}
