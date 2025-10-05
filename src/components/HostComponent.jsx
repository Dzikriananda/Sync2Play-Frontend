import { useState} from 'react'
import CustomAudioPlayer from './CustomAudioPlayer';
import FileInput from './FileInput';
import axios from "axios";


function HostComponent() {
  const [count, setCount] = useState(0);
  const [url,setUrl] = useState("");
  const [isReady,setIsReady] = useState(false);
  const [file,setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading,setIsUploading] = useState(false);

  const onFileChoosen= (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const sizeInKB = (selectedFile.size / 1024).toFixed(2); // KB
      const extension = selectedFile.name.split(".").pop();   // file extension
      const type = selectedFile.type;                         // MIME type
      setFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const onFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("audio", file, file.name);
      
      const response = await axios.post(
        "http://43.173.1.87:9000/api/audio/upload", 
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );
      console.log("✅ Upload success:", response.data);
    } catch (error) {
      setProgress(0);
      console.error("❌ Upload failed:", error);
    }
  };

  
  
  return (
    <div className='max-w-[500px] min-h-96 bg-white rounded-2xl shadow-2xs p-8'>
      <h1 className='text-3xl font-extrabold text-gray-800'>Sync2Play</h1>
      <h2 className=' text-gray-500 mt-2'>Enter a direct link to an audio file (.mp3, .wav) to play and download it.</h2>
      <h2 className=' text-gray-700 font-medium text-sm mt-6'>Audio File Url</h2>
      <input className='mt-1 border-1 border-gray-300 rounded-lg w-full h-9 px-2 shadow-md' type="text" placeholder='e.g., https://dreamybull.com/song.mp3' />
      <div className='h-3'/>
      <div className='flex flex-row'>
      <div className='w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'>
        Load URL
      </div>
      <div className='w-3'/>
      {/* <div 
        className='  text-center w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50'
        onClick={() => setIsReady(true)}
        >
        Upload a File
      </div> */}
      <FileInput onFileChoosen={onFileChoosen}/>

      </div>
      {(isReady) ? <CustomAudioPlayer/> : null}
      <h1 className="break-all whitespace-normal text-center mt-3 mb-3">{(file != null) ? file.name : ""}</h1>
      {
        (file != null) ?
        <div onClick={() => onFileUpload()} className='w-full text-center bg-blue-500 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'>
            Upload This File
        </div> : null
      }
       {progress > 0 && (
        <div className="mt-6 w-full bg-gray-200 rounded-full h-6">
          <div
            className="h-6 bg-green-500 text-white rounded-full flex items-center justify-center transition-all duration-300"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}
    </div>
  );

}


export default HostComponent;