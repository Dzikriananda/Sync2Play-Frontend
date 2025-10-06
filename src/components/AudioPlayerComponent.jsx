import { useState,useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { Play,Pause, RefreshCw } from 'lucide-react';
import { socket } from '../socket';

const AudioPlayerComponent = ({data,file}) => {
    const audioRef = useRef(null);
    console.log(file);
    const audioUrl = URL.createObjectURL(file);
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
      <motion.div
        layout
        transition={{ layout: { duration: 0.4, ease: "easeInOut" } }}
        className="max-w-[500px] min-h-64 bg-white rounded-2xl shadow-2xs p-8"
      >
        <h1 className="text-3xl font-extrabold text-gray-800">Sync2Play</h1>
        <h2 className="text-gray-500 mt-2">
          Code for this session is {data.sessionId}, Share to your friends to join!!
        </h2>
        <h2 className="text-gray-500 mt-2">
          Number of users has joined : 0
        </h2>
        <CustomAudioPlayer audioUrl={audioUrl}/>
        <div className="w-full h-[1px] bg-gray-300/70 rounded-full mt-2 mb-1" />
        <h2 className='text-center'>Now Playing Chrisye - Andai Aku Bisa.mp3</h2>

         
  
       
      </motion.div>
  
    );
  };

  function CustomAudioPlayer({audioUrl}) {
    const playerRef = useRef(null);
    const [isPlaying,setIsPlaying]= useState(false);

    function resolveAfter2Seconds() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("resolved");
        }, 2000);
      });
    }
  
    function handlePlay() {
      setIsPlaying(true);
      playerRef.current.audio.current.play(); // play the audio

    }
  
    const handlePause = () => {
      setIsPlaying(false);
      playerRef.current.audio.current.pause(); // pause it
    };
  
    const handleSkip = (seconds) => {
      playerRef.current.audio.current.currentTime += seconds; // skip forward/back
    };

    const handleRestart = () => {
      playerRef.current.audio.current.currentTime = 0; 
    };

  
    return (
      <div className="mt-4 flex flex-col items-center gap-3">
          <AudioPlayer
            style={{
              pointerEvents: "none", // 👈 makes it unclickable
            }}
            ref={playerRef}
            src= {audioUrl}
            onPlay={() => console.log("Playing")}
            customIcons={{ play: null, pause: null }} // removes icons
            customControlsSection={[]} // hides all control sections
            showJumpControls={false}
            customAdditionalControls={[]} // hides extra icons (like loop)
            customVolumeControls={[]} // hides volume slider
          />
          <div className="flex gap-2">
            {
              (!isPlaying) ?
                <button
                  onClick={handlePlay}
                  className="bg-green-500 text-white px-3 py-2 rounded min-w-24"
                >
                  <div className='flex flex-row'>
                    <Play/>
                    <div className='w-2'/>
                    <h2>Play</h2>
                  </div>
                </button>
                :
                <button
                  onClick={handlePause}
                  className="bg-red-500 text-white px-3 py-2 rounded min-w-24"
                >
                  <div className='flex flex-row'>
                    <Pause/>
                    <div className='w-2'/>
                    <h2>Pause</h2>
                  </div>
                </button>

            }
        
            <button
              onClick={handleRestart}
              className="bg-green-500 text-white px-3 py-2 rounded"
            >
              <div className='flex flex-row'>
                <RefreshCw/>
                <div className='w-2'/>
                <h2>Restart</h2>
              </div>
            </button>

        </div>
      </div>
    );
  }

export default AudioPlayerComponent;