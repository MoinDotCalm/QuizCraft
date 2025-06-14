
import React from 'react';

export default function OutputSection({ summary }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h2>Summary</h2>
      <p>{summary}</p>
    </div>
  );
}
