import { use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomAudioPlayer from './AudioPlayerComponent';
import FileInput from './FileInput';
import axios from "axios";
import { Riple } from 'react-loading-indicators';
import HostAudioPrepComponent from './HostAudioPrepComponent';
import AudioPlayerComponent from './AudioPlayerComponent';
import LoadingComponent from './LoadingComponent';
function HostComponent() {

  const [response,setResponse] = useState(null);
  const [file,setFile] = useState(null);
  const [isAudioReady,setIsAudioReady] = useState(false);
  const [loading,setLoading] = useState(false);
  const [isUploadFinished, setIsUploadFinished] = useState(false);


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
      {(loading || isUploadFinished )? (
        <div>
          <LoadingComponent/>
          <HostAudioPrepComponent callBackWhenMediaReady={onAudioReady} callBackWhenUploadFinished = {() => {setIsUploadFinished(true)}}/>
        </div>
      ) : isAudioReady ? (
        <AudioPlayerComponent data={response} file={file}/>
      ) : (
        <HostAudioPrepComponent callBackWhenMediaReady={onAudioReady} callBackWhenUploadFinished = {() => {setIsUploadFinished(true)}}/>
      )}
    </div>
  );
    
}



export default HostComponent;
