// src/App.jsx
import React from 'react';
import AssetLoader from './components/AssetLoader';

function App() {
  return (
    <div>
      <h1>Elparadisogonzalo Asset Module</h1>

      {/* Image from assets folder */}
      <AssetLoader path="logo.png" alt="Project Logo" />

      {/* JSON or any other file (links to download/view) */}
      <AssetLoader path="data/sample.json" />
    </div>
  );
}

export default App;
