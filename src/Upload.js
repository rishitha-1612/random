import { useState } from "react";

export default function Upload() {
  const [fileName, setFileName] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) {
      setFileName(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".csv")) {
      setFileName(file.name);
    }
  };

  return (
    <div className="upload-page">
      <h2>Upload Transaction Data</h2>

      <div
        className="drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag & Drop CSV File Here</p>
        <p>or</p>
        <label className="file-input-label">
          Browse File
          <input type="file" accept=".csv" onChange={handleFileSelect} hidden />
        </label>
      </div>
      

      {fileName && (
        <p className="file-name">Selected File: {fileName}</p>
      )}
    </div>
  );
}
