import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileInput from './FileInput';
import axios from "axios";
import { Riple } from 'react-loading-indicators';


function HostAudioPrepComponent({callBackWhenMediaReady,callBackWhenUploadFinished}) {
  const [url, setUrl] = useState("");
  const [urlError,setUrlError] = useState({error : false, message: ""});
  const [urlCheckLoading,setUrlCheckLoading] = useState(false);
  const [youtubeData,setYoutubeData] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading,setIsUploading] = useState(false);
  const [isMediaValid, setIsMediaValid] = useState(null);
  const [ytConvertProgress,setYtConvertProgress] = useState({status : 'null'});
  const [isInProgressOfConverting,setIsInProgressOfConverting] = useState(false);
  const [isDownloading,setIsDownloading] = useState(false);
  const [downloadProgress,setDownloadProgress] = useState({progress : null,message : null,error : false});
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

  function resetUploadMedia() {
    setIsMediaValid(null);
    setFile(null);
  }

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  function isValidYoutubeUrl(string) {
    const isAnUrl = isValidUrl(string);
    if(!isAnUrl) {
      return false;
    } else {
      return isYouTubeUrl(string);
    }
  }

  
  async function checkUrl() {
      if(!isUploading && !isInProgressOfConverting && !isDownloading) {
        setYtConvertProgress({
          status: 'null',
        });
        setUrlError({error : false, message : ""});
        if(!isValidYoutubeUrl(url)) {
          setUrlError({error : true, message : "Url is Not a Valid Youtube Url"});
        } else {
          try {
            resetUploadMedia();
            setYoutubeData(null);   
            setUrlCheckLoading(true);
            const ytUrl = normalizeYouTubeUrl(url)
            const response = await axios.get(
              `${baseUrl}/api/audio/youtube/info`,
              {
                params: {videoId : ytUrl}
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

  function isYouTubeUrl(url) {
    return url.includes('youtube.com') || url.includes('youtu.be');
  }

  function normalizeYouTubeUrl(inputUrl) {
      try {
        const url = new URL(inputUrl);
    
        if (url.hostname === 'youtu.be') {
          const videoId = url.pathname.slice(1); // remove leading "/"
          return `https://www.youtube.com/watch?v=${videoId}`;
        }
    
        if (url.hostname === 'm.youtube.com') {
          url.hostname = 'www.youtube.com';
          return url.toString();
        }
    
        return inputUrl;
      } catch (e) {
        return inputUrl; 
    }
  }
  

  const onFileChoosen = (e) => {
    setYoutubeData(null);
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
    if(!isUploading && !isInProgressOfConverting) {
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

  async function downloadAudio(jobId,hostToken) {
    if (!isDownloading) {
      console.log('sedang download');
      try {
        setIsDownloading(true);
        const response = await axios.get(
          `${baseUrl}/api/audio/download`,
          {
            params: {sessionId : jobId},
            withCredentials: false,
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
              const { loaded, total } = progressEvent;
              let percentCompleted = 0;
              if (total) {
                percentCompleted = Math.round((loaded * 100) / total);
              }
              setDownloadProgress({progress : percentCompleted});
            },
          }
        );
        console.log(response);
        if(response.status == 200) {
          const disposition = response.headers['content-disposition'];

          let filename = 'audio.mp3'; // default fallback
          if (disposition) {
            const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
            if (filenameMatch && filenameMatch[1]) {
              filename = decodeURIComponent(filenameMatch[1]);
            }
          }
          //PENTING AGAR UBAH MENJADI FILE DENGAN METADATA SEPERTI TYPE, AGAR BISA DIMAINKAN DI IPHONE
          const parsedFile = new File([response.data], filename,  { type: 'audio/mpeg' } );
          callBackWhenMediaReady({sessionId : jobId, hostToken : hostToken},parsedFile);
          setIsDownloading(false);
        } else {
          setIsDownloading(false);
          setDownloadProgress({progress : null,error : true, message: "Error while downloading"});
        }
  
      } catch(e) {
        console.log('error while download:', e);
        console.log('error config:', e.config);
        console.log('error response:', e.response);
        setIsDownloading(false);
        setDownloadProgress({progress : null,error : true, message: "Error while downloading"});
      }
    }
  }

  

  async function convertYtToAudio() {
    if(!isInProgressOfConverting) {
      setIsInProgressOfConverting(true);
      setYtConvertProgress({
        status : 'pending',
        message : 'Getting Video Info...'
        
      })
      try {
        const ytUrl = normalizeYouTubeUrl(url)
        const response = await axios.get(
          `${baseUrl}/api/audio/youtube/download`,
          {
            params: {videoId : ytUrl}
          }
        );
        if (response.status === 200) {
          const jobId = response.data.jobId;
          const hostToken = response.data.hostToken;
          checkYtConversionJobProgress(jobId,hostToken);
        } else {
          throw new Error("Conversion Failed. Try Again");
        }
  
      } catch(e) {
        setIsInProgressOfConverting(false);
        setYtConvertProgress({
          status : 'error',
          message : e
        })
  
      }
    }

  }

  async function checkYtConversionJobProgress(jobId,hostToken) {
    const intervalMs = 2000; 
    const maxAttempts = 60;
    let attempts = 0;

    const intervalId = setInterval(async () => {
      attempts++;

      try {
        const res = await axios.get(`${baseUrl}/api/audio/progress/${jobId}`)
        const data = res.data;
        console.log(data);
        //response: { status: 'pending' | 'finished' | 'error', url?: '...' }
        if (data.status === 'done') {
          clearInterval(intervalId);
          setYtConvertProgress({
            status: 'done',
            message: 'Conversion complete!',
          });
          setIsInProgressOfConverting(false);
          downloadAudio(jobId,hostToken);
          
        } else if (data.status === 'error') {
          clearInterval(intervalId);
          setYtConvertProgress({
            status: 'error',
            message: 'Conversion failed on server, try again'
          });
          setIsInProgressOfConverting(false);
        } else {
          setYtConvertProgress({
            status: 'pending',
            message: `Converting, Could take up to 15 seconds...`
          });
        }

      } catch (err) {
        setIsInProgressOfConverting(false);
        clearInterval(intervalId);
        setYtConvertProgress({
          status: 'error',
          message: `${err.message || String(err)}. Try Again`
        });
      }
      if (attempts >= maxAttempts) {
        setIsInProgressOfConverting(false);
        clearInterval(intervalId);
        setYtConvertProgress({
          status: 'error',
          message: 'Conversion timed out, try again'
        });
      }
    }, intervalMs);
  }

  // useEffect(() => {
  //   if (ytConvertProgress.status === 'done') {
  //     console.log('Conversion is complete!');
  //     downloadAudio();
  //   }
  // }, [ytConvertProgress.status]);

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
      className="max-w-full sm:max-w-[500px] sm:mx-0 max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xs p-8"
    >
      <h1 className="text-3xl font-extrabold text-gray-800">Sync2Play</h1>
      <h2 className="text-gray-500 mt-2">
        Enter a link to a youtube video or you can upload your own mp3 audio file.
      </h2>

      <h2 className="text-gray-700 font-medium text-sm mt-6">Youtube Url</h2>
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
          className={`w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 ${((isUploading || isDownloading || isInProgressOfConverting)) ? 'opacity-50' : null} text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer`}
          onClick={checkUrl}
        >
          {
            urlCheckLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <h2>Load URL</h2>
          }
        </div>
        <div className="w-3" />
        <FileInput onFileChoosen={onFileChoosen} isClickable={(!isUploading && !isDownloading &&!isInProgressOfConverting)} />
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
            key="upload_progress"
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
      {/* <AnimatePresence>
        {downloadProgress.progress > 0 && (
          <motion.div
            key="download_progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 w-full bg-gray-200 rounded-full h-6 overflow-hidden"
          >
            <motion.div
              className="h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
              style={{ width: `${downloadProgress.progress}%` }}
              transition={{ duration: 0.3 }}
            >
              {downloadProgress.progress }%
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence> */}

      {
        (youtubeData != null) ? 
        <div>
            <div className="mt-4 p-3 border border-gray-200 rounded-lg flex flex-col sm:flex-row items-center sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 bg-gray-50 shadow-inner mb-6">              <img
                src={youtubeData.thumbnail}
                alt="Cover Art"
                className="max-h-64 w-auto max-w-full sm:max-w-64 rounded-md object-cover"
                // className="h-36 w-auto max-w-full sm:max-w-64 rounded-md object-cover"
              />
              <div className="flex-1 min-w-0 self-start">
                <p className="text-sm font-semibold text-gray-800 break-words">
                  {youtubeData.title}
                  
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {youtubeData.channelName}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  {convertSecondsToReadableFormat(youtubeData.length)}
                </p>
              </div>
              
              
            </div>
            {
              (ytConvertProgress.status != 'done' ) ? 
                <div
                  onClick={convertYtToAudio}
                  className="w-full  flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 cursor-pointer"
                >
                  {(isInProgressOfConverting) ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <h2>Use this audio</h2>}
                </div>
                : 
                <AnimatePresence>
                  {downloadProgress.progress > 0 && (
                    <motion.div
                      key="download_progress"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 w-full bg-gray-200 rounded-full h-6 overflow-hidden"
                    >
                      <motion.div
                        className="h-6 bg-green-500 text-white rounded-full flex items-center justify-center"
                        style={{ width: `${downloadProgress.progress}%` }}
                        transition={{ duration: 0.3 }}
                      >
                        {downloadProgress.progress }%
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
            }
          {
            (ytConvertProgress.status != 'null') ? 
            <div className='flex items-center justify-center'>
              <h3 className={`${(ytConvertProgress.status === 'error') ? 'text-red-500' : null }`}>{ytConvertProgress.message}</h3> 
            </div> : null
          }
          
        </div>
      
        : null
      }
    </motion.div>
  );
}

function convertSecondsToReadableFormat(input) {
  const totalSeconds = parseInt(input, 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedLength = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  return formattedLength;
}

export default HostAudioPrepComponent;
