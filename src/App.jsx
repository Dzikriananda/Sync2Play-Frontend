import { useState,useRef,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import AudioPlayer from 'react-h5-audio-player';
import { AnimatePresence, motion } from "framer-motion";
import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import bg from './assets/bg.jpg';
function App() {
  const [userRole,setUserRole] = useState(null);

  const handleChooseRoleClick = (role) => {
    addDummyPage();
    setUserRole(role);
  };

  let content;
  if(userRole === 'host') {
    content = <HostComponent/>
  } else if (userRole === 'listener') {
    content = <ListenerComponent/>
  } else {
    content = <PreComponent onRoleClick={handleChooseRoleClick}/>
  }

  function addDummyPage() {
    // 1. Push an empty state on initial load. This creates a "trap" in the history.
    // The current URL remains the same, but a new history entry is created.
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event) => {
      // 2. When popstate fires (meaning user pressed back), immediately push a new state.
      // This effectively "replaces" the state the user just navigated from,
      // keeping them on the current page and preventing them from going further back.
      window.history.pushState(null, "", window.location.href);
      setUserRole(null);
      // You could also add logic here to confirm if the user really wants to leave,
      // or redirect them to a specific part of your app.
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  };

  return (
    <div className='h-screen w-screen  flex justify-center items-center p-4 md:p-0'>
        <img
          src={bg}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
       />
       <AnimatePresence mode="wait">
        <motion.div
          key={userRole} // penting buat re-trigger animasi
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className=" z-10 w-full flex justify-center items-center"
        >
          {content}
        </motion.div>
      </AnimatePresence>
    </div>

  )
}

function PreComponent({onRoleClick}) {
  return (
    <div className='min-w-96 min-h-60 bg-white rounded-2xl shadow-2xs p-8'>
      <h1 className='text-3xl font-extrabold text-gray-800'>Welcome to Sync2Play </h1>
      <h2 className=' text-gray-500 mt-2 text-xl mb-16'>Are you the host or the listener?</h2>
      <div className='flex flex-row'>
        <div className='w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50' onClick={() => onRoleClick('host')}>
          I am the Host
        </div>
        <div className='w-3'/>
        <div className='w-full text-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50' onClick={() => onRoleClick('listener')}>
          I am the Listener
        </div>
      </div>
      <h2 className=' text-blue-500 mt-2 text-lg '>Choose the role to continue</h2>
    </div>
  );
}

function ListenerComponent() {
  const [code, setCode] = useState("");



  function handleChange(e) {
    const value = e.target.value;
    if (value.length <= 6) {
      setCode(value);
    }
  }
  

  return (
    <div className='min-w-96 min-h-64 bg-white rounded-2xl shadow-2xs p-8'>
      <h1 className='text-3xl font-extrabold text-gray-800'>Sync2Play</h1>
      <h2 className=' text-gray-500 mt-2'>Enter a Host Code consisted of 6 Characters</h2>
      <h2 className=' text-gray-700 font-medium text-sm mt-6'>Host Code</h2>
      <input className='mt-1 border-1 border-black rounded-lg w-full h-9 px-2 shadow-2xs' type="text" placeholder='e.g., GS8aF' value={code} onChange={(val) => handleChange(val)} maxLength={6}/>
      <div className='mt-8 w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50' >
        Enter
      </div>
      {/* {(false) ? <CustomAudioPlayer/> : null} */}
      
    </div>
  );
}

function HostComponent() {
  const [count, setCount] = useState(0);
  const [url,setUrl] = useState("");
  const [isReady,setIsReady] = useState(false);
  const [fileName, setFileName] = useState("No file chosen");
  const handleChoosenFile = (msg) => {
    setFileName(msg);
  };

  return (
    <div className='min-w-96 min-h-96 bg-white rounded-2xl shadow-2xs p-8'>
      <h1 className='text-3xl font-extrabold text-gray-800'>Sync2Play</h1>
      <h2 className=' text-gray-500 mt-2'>Enter a direct link to an audio file (.mp3, .wav) to play and download it.</h2>
      <h2 className=' text-gray-700 font-medium text-sm mt-6'>Audio File Url</h2>
      <input className='mt-1 border-1 border-black rounded-lg w-full h-9 px-2 shadow-2xs' type="text" placeholder='e.g., https://dreamybull.com/song.mp3' />
      <div className='h-3'/>
      <div className='flex flex-row'>
      <div className='w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50'>
        Load
      </div>
      <div className='w-3'/>
      {/* <div 
        className='  text-center w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-opacity-50'
        onClick={() => setIsReady(true)}
        >
        Upload a File
      </div> */}
      <FileInput onFileChoosen={handleChoosenFile}/>

      </div>
      {(isReady) ? <CustomAudioPlayer/> : null}
      <h1>{fileName}</h1>
      <AlertDialog/>
    </div>
  );

}

const FileInput = ({ onFileChoosen }) => {
  const inputRef = useRef(null);
  const [fileInfo, setFileInfo] = useState(null);


  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const sizeInKB = (file.size / 1024).toFixed(2); // KB
      const extension = file.name.split(".").pop();   // file extension
      const type = file.type;                         // MIME type

      setFileInfo({
        name: file.name,
        size: `${sizeInKB} KB`,
        extension,
        type,
      });
      console.log({
        name: file.name,
        size: `${sizeInKB} KB`,
        extension,
        type,
      });
      onFileChoosen(file.name);
    } else {
      setFileInfo(null);
    }
  };

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
        onChange={handleChange}
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


const Player = () => (
  <audio controls
  id="myAudio"
  preload="auto"
  src="https://onlinetestcase.com/wp-content/uploads/2023/06/1-MB-MP3.mp3"
  type="audio/mpeg"
  />
);

const CustomAudioPlayer = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className='mt-5'>
      <audio
        ref={audioRef}
        src="https://onlinetestcase.com/wp-content/uploads/2023/06/1-MB-MP3.mp3"
        type="audio/mpeg"
      />

      <button  className='w-full h-12 bg-blue-400 rounded-lg text-white' onClick={togglePlayPause}>
        {isPlaying ? "⏸ Pause" : "▶️ Play"}
      </button>
    </div>
  );
};

function AlertDialog() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <Button variant="outlined" onClick={handleClickOpen}>
        Open alert dialog
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Let Google help apps determine location. This means sending anonymous
            location data to Google, even when no apps are running.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleClose} autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

export default App
