import React, { useState, useEffect } from 'react';
import axios from "axios";
import { motion, AnimatePresence } from 'framer-motion';

export default function EnterCodeComponent({onMediaDownloaded}) {
  const [code, setCode] = useState("");
  const [error,setError] = useState({error : false, message: ""});
  const [isSessionExist,setIsSessionExist] = useState(false);
  const [isLoading,setLoading] = useState(false);
  const [isDownloading,setIsDownloading] = useState(false);
  const [downloadProgress,setDownloadProgress] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_API_URL;

  function handleChange(e) {
    const value = e.target.value;
    if (value.length <= 6) {
      setCode(value);
    }
  }

  // useEffect(() -> {
  //   if(isMediaReady) {

  //   }
  // },[isMediaReady]);

  useEffect(() => {
    const downloadFile = async () => {
      if (isSessionExist) {
        try {
          setIsDownloading(true);
          const response = await axios.get(
            `${baseUrl}/api/audio/download`,
            {
              params: {sessionId : code},
              responseType: 'blob',
              onDownloadProgress: (progressEvent) => {
                const { loaded, total } = progressEvent;
                let percentCompleted = 0;
                if (total) {
                  percentCompleted = Math.round((loaded * 100) / total);
                }
                setDownloadProgress(percentCompleted);
                console.log(`Downloaded: ${percentCompleted}%`);
              },
            }
          );
          if(response.status == 200) {
            onMediaDownloaded(code,response.data);
            setIsDownloading(false);
          } else {
            setIsDownloading(false);
            setError({error : true, message: "Error while downloading"})
          }
    
        } catch(e) {
          setIsDownloading(false);
          setError({error : true, message: "Error, Try Again"})
        }
      }
    }
    downloadFile();
  }, [isSessionExist]);


  async function checkIfSessionExist() {
    if(!isDownloading && !isLoading) {
      if(code.length != 6) {
        setError({error : true, message: "Code must be 6 length"})
      } else {
        try {
          setLoading(true);
          const response = await axios.get(
            `${baseUrl}/api/audio/is-session-exist`,
            {
              params: {sessionId : code}
            }
          );
          setLoading(false);
          if(response.status == 200) {
            setError({error : false,message:""})
            setIsSessionExist(true);
          } 
        } catch(e) {
          setLoading(false);
          if (e.response && e.response.status === 404) {
            setError({ error: true, message: "Error, Session doesn't exist" });
          } else {
            setError({ error: true, message: "Error, Try Again" });
          }
        }
      }
    }
  }  

  return (
    <motion.div className='min-w-96 min-h-64 bg-white rounded-2xl shadow-2xs p-8'>
      <h1 className='text-3xl font-extrabold text-gray-800'>Sync2Play</h1>
      <h2 className=' text-gray-500 mt-2'>Enter a Session Code consisted of 6 Characters</h2>
      <h2 className=' text-gray-700 font-medium text-sm mt-6'>Session Code</h2>
      <input className='mt-1 rounded-lg w-full h-9 px-2 border-1 border-gray-300 shadow-md' type="text" placeholder='e.g., GS8aF' value={code} onChange={(val) => handleChange(val)} maxLength={6}/>
      {
        (error) ? <h3 className="text-red-500 text-sm mt-1 ml-2">{error.message}</h3> : null
      }
      {
        (isSessionExist) ? <h3 className="text-green-500 text-sm mt-1 ml-2">Session Found, Downloading Audio...</h3> : null
      }
      <div onClick={checkIfSessionExist} className='mt-8 w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50' >
        <div className='flex justify-center items-center'>
          {
            isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"/>  : <h2>Enter</h2>
          }
        </div>
      </div>
      <AnimatePresence>
        {downloadProgress > 0 && (
          <motion.div
            key="progress"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 w-full bg-gray-200 rounded-full h-6 overflow-hidden"
          >
            <motion.div
              className={`h-6 w-[${downloadProgress}%]  bg-green-500 text-white rounded-full flex items-center justify-center`}
              transition={{ duration: 0.3 }}
            >
              {downloadProgress}%
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* {(false) ? <CustomAudioPlayer/> : null} */}      
    </motion.div>
  );
}

