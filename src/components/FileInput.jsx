import { useState,useRef } from 'react'

const FileInput = ({ onFileChoosen }) => {
  const inputRef = useRef(null);

  const handleClick = () => {
    inputRef.current.click(); // programmatically open file dialog
  };

  return (
    <div className="w-full">
      {/* Hidden real input */}
      <input
        type="file"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={onFileChoosen}
      />

      {/* Custom styled button */}
      <div
        onClick={handleClick}
        className="text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg cursor-pointer"
      >
        Upload a File
      </div>

      {/* Show selected filename */}
      {/* <p className="mt-2 text-gray-600 text-sm">{fileName}</p> */}
    </div>
  );
};

export default FileInput;