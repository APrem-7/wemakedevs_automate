import { useState } from 'react';

export default function Home() {
  const [state, setState] = useState('idle');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Welcome to ORCA</h1>
      <p>Your integrated workflow management app.</p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => setState('working')} 
          style={{ padding: '10px 20px', cursor: 'pointer' }}
        >
          Start a Workflow
        </button>
        <p style={{ marginTop: '20px' }}>Current State: <strong>{state}</strong></p>
      </div>
    </div>
  );
}