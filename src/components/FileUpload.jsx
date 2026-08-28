import React, { useState } from 'react';
import { API } from '@/config';

const FileUpload = () => {
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]; // Corrected 'files' property
    if (!file) return;
    setLoading(true);

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "innoide"); // Corrected "upload_preset"
    data.append("cloud_name", "dnonssl9s");

    try {
      const res = await fetch(`${API.CLOUDINARY}/v1_1/dnonssl9s/image/upload`, {
        method: "POST",
        body: data,
      });
      const uploadedImage = await res.json();
      console.log(uploadedImage.url);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <div className="upload-container">
        <div className="upload-icon">
          {/* {loading ? "Uploading..." : <img src="upload.svg" alt="Upload" />} */}
          <h1>INNOIDE</h1>
        </div>
        <input
          type="file"
          className="file-input"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};

export default FileUpload;
