import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileInput from './FileInput';
import axios from "axios";
import { Riple } from 'react-loading-indicators';


function HostAudioPrepComponent({callBackWhenMediaReady,callBackWhenUploadFinished}) {
  const [url, setUrl] = useState("");
  const [urlError,setUrlError] = useState({error : false, message: ""});
  const [urlCheckLoading,setUrlCheckLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [youtubeData,setYoutubeData] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading,setIsUploading] = useState(false);
  const [isMediaValid, setIsMediaValid] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_API_URL;


  const validMediaMime = new Map([
    ["wav", "audio/wav"],
    ["mp3", "audio/mpeg"]
  ]);   

  function isAnAudioFile(type) {
    const iterator = validMediaMime.values();
    for (const value of iterator) {
      if (type === value) return true;
    }
    return false;
  }

  const isValidUrl = (string) => {
    console.log(string);
    try {
      new URL(string);
      console.log('url valid');
      return true;
    } catch (_) {
      console.log('url not valid');
      return false;
    }
  };

  
  async function checkUrl() {
      if(!isUploading) {
        setUrlError({error : false, message : ""});
        if(!isValidUrl(url)) {
          setUrlError({error : true, message : "Url is Not Valid"});
        } else {
          try {
            setUrlCheckLoading(true);
            const response = await axios.get(
              `${baseUrl}/api/audio/youtube/info`,
              {
                params: {videoId : url}
              }
            );
            setUrlCheckLoading(false);
            if(response.status == 200) {
              setYoutubeData(response.data);
            } 
          } catch(e) {
            setUrlCheckLoading(false);
            setUrlError({error : true, message : "An error has occured. Try again."});
          }
        }
      }
  }  

  const onFileChoosen = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const sizeInKB = (selectedFile.size / 1024).toFixed(2);
      console.log(selectedFile);
      const type = selectedFile.type;
      if (!isAnAudioFile(type)) {
        setFile(null);
        setIsMediaValid({
          isValid: false,
          message: "Invalid file type selected. Please choose an audio file (.mp3, .wav)"
        });
      } else if (sizeInKB > 20480) {
        setFile(null);
        setIsMediaValid({
          isValid: false,
          message: "File must be smaller than 20 MB!"
        });
      } else {
        setIsMediaValid({ isValid: true, message: "File is valid" });
        setFile(selectedFile);
      }
    } else {
      setFile(null);
    }
  };

  const onFileUpload = async () => {
    if(!isUploading) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("audio", file, file.name);
  
        const response = await axios.post(
          `${baseUrl}/api/audio/upload`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              if(percentCompleted == 100) {
                callBackWhenUploadFinished();
              }
              setProgress(percentCompleted);
            },
          }
        );
        if (response.status === 200) {
          setIsUploading(false);
          callBackWhenMediaReady(response.data,file);
        }
      } catch (error) {
        setIsUploading(false);
        setProgress(0);
        console.error("❌ Upload failed:", error);
      }
    }
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
      className="max-w-full sm:max-w-[500px] sm:mx-0 mx-1 max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xs p-8"
    >
      <h1 className="text-3xl font-extrabold text-gray-800">Sync2Play</h1>
      <h2 className="text-gray-500 mt-2">
        Enter a direct link to an audio file (.mp3, .wav) to play and download it.
      </h2>

      <h2 className="text-gray-700 font-medium text-sm mt-6">Audio File Url</h2>
      <input
        className="mt-1 border border-gray-300 rounded-lg w-full h-9 px-2 shadow-md"
        type="text"
        onChange={(e) => {setUrl(e.target.value)}}
        placeholder="e.g., https://dreamybull.com/song.mp3"
      />
      {
        (urlError.error) ? <p className='text-red-500 text-sm ml-3 mt-1'>{urlError.message}</p> :  null
      }
      <div className="h-3" />
      <div className="flex flex-row">
        <div
          className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
          onClick={checkUrl}
        >
          {
            urlCheckLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <h2>Load URL</h2>
          }
        </div>
        <div className="w-3" />
        <FileInput onFileChoosen={onFileChoosen} />
      </div>


      <AnimatePresence>
        {file && (
          <motion.div
            key="fileInfo"
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="break-all whitespace-normal text-center mt-3 mb-3">
              {file.name}
            </h1>
            <div
              onClick={onFileUpload}
              className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
            >
              Upload This File
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMediaValid && !isMediaValid.isValid && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 text-sm mt-2"
          >
            Error: {isMediaValid.message}.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {progress > 0 && (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 w-full bg-gray-200 rounded-full h-6 overflow-hidden"
          >
            <motion.div
              className="h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              {progress}%
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {
        (youtubeData != null) ? 
        <div>
            <div className="mt-4 p-3 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-gray-50 shadow-inner mb-6">              <img
                src={youtubeData.thumbnailUrl}
                alt="Cover Art"
                className="h-36 w-auto max-w-full sm:max-w-64 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 break-words">
                  {youtubeData.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {youtubeData.channelName}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {youtubeData.length}
                </p>
              </div>
              
              
            </div>
              <div
              onClick={() => {}}
              className="w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
            >
            Use this audio
          </div>
        </div>
      
        : null
      }
    </motion.div>
  );
}

export default HostAudioPrepComponent;
