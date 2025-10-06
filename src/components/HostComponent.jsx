import { use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomAudioPlayer from './AudioPlayerComponent';
import FileInput from './FileInput';
import axios from "axios";
import { Riple } from 'react-loading-indicators';
import HostAudioPrepComponent from './HostAudioPrepComponent';
import AudioPlayerComponent from './AudioPlayerComponent';

function HostComponent() {

  const [response,setResponse] = useState(null);
  const [file,setFile] = useState(null);
  const [isAudioReady,setIsAudioReady] = useState(false);
  const [loading,setLoading] = useState(false);

  const onAudioReady = async (data,fileInput) => {
    setLoading(true);
    setFile(fileInput);
    console.log(fileInput);
    setResponse(data);
    setIsAudioReady(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
  };

  
  return (
    <div>
      {loading ? (
        <div>
          <LoadingComponent/>
          <HostAudioPrepComponent callBackWhenMediaReady={onAudioReady}/>
        </div>
      ) : isAudioReady ? (
        <AudioPlayerComponent data={response} file={file}/>
      ) : (
        <HostAudioPrepComponent callBackWhenMediaReady={onAudioReady}/>
      )}
    </div>
  );
    
}

function LoadingComponent() {
  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"> 
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"/> 
    </div>
  );
}

export default HostComponent;
