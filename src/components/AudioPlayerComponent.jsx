  import { useState,useRef,useEffect,useImperativeHandle, useMemo } from 'react'
  import { motion, AnimatePresence } from 'framer-motion';
  import AudioPlayer from 'react-h5-audio-player';
  import 'react-h5-audio-player/lib/styles.css';
  import { Play,Pause, RefreshCw } from 'lucide-react';
  import { socket } from '../socket';
  import { OrbitProgress} from 'react-loading-indicators';
  import LoadingComponent from './LoadingComponent';

  const AudioPlayerComponent = ({data,file}) => {
      const audioUrl = URL.createObjectURL(file);
      const [isCountingDown, setIsIsCountingDown] = useState(false);
      const [isConnected, setIsConnected] = useState(socket.connected);
      const [isHost,setIsHost] = useState(false);

      const playerRef = useRef(null);

      useEffect(() => {
        if(data.hostToken != null){
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      },[]);

      function handlePlayCommand(startTime) {
        setIsIsCountingDown(true);
        const now = Date.now() / 1000;
        const delay = (startTime - now) * 1000;
        console.log(`Audio will play in ${delay.toFixed(0)} ms`);
        setTimeout(() => {
          setIsIsCountingDown(false);
          setTimeout(() => playerRef.current?.playAudio(), 100);
        }, delay);
      }

      function handlePauseCommand() {
        playerRef.current?.pauseAudio(); // call child’s pause
      }

      useEffect(() => {
        socket.connect();
    
        return () => {
          socket.disconnect();
        };
      }, []);

      useEffect(() => {
        async function onConnect() {
          setTimeout(() => {}, 2000);
          setIsConnected(true);
          socket.emit('join-session', data.sessionId);
        }
    
        function onDisconnect() {
          setIsConnected(false);
        }
    
        async function onEvent(value) {
          const command = value.command;
          const startTime = value.startTime;
          if(command === 'play') {
            handlePlayCommand(startTime);
          } else {
            handlePauseCommand();
          }
        }
    
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('session-message', onEvent);
    
        return () => {
          socket.off('connect', onConnect);
          socket.off('disconnect', onDisconnect);
          socket.off('session-message', onEvent);
        };
      }, []);

      function play() {
        socket.emit('play',data.hostToken);
      }

      

    
      return (
        <div>
          {!isConnected ? <LoadingComponent/> : null}
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
            <CustomAudioPlayer playerRef={playerRef} audioUrl={audioUrl} onPlayClicked={play} isCountingDown={isCountingDown} isHost={isHost}/>
            <div className="w-full h-[1px] bg-gray-300/70 rounded-full mt-2 mb-1" />
            {(isCountingDown) ? 
              <div className="flex justify-center items-center mt-4">
                  <OrbitProgress color="#32cd32" size="large" text="SENDING.." textColor="" />
              </div>
              : null
            }
            <h2 className='text-center'>Now Playing {file.name}</h2>
          </motion.div>
        </div>
    
      );
    };

    function CustomAudioPlayer({ playerRef, audioUrl, onPlayClicked, isCountingDown,isHost}) {

      const audioRef = useRef(audioUrl); // store the initial URL
      const internalRef = useRef(null)
      const [isPlaying, setIsPlaying] = useState(false)
      const stableAudioUrl = audioRef.current; // use this in your AudioPlayer
    
      // ✅ Expose control methods to parent
      useImperativeHandle(playerRef, () => ({
        playAudio() {
          internalRef.current.audio.current.play()
          setIsPlaying(true)
        },
        pauseAudio() {
          internalRef.current.audio.current.pause()
          setIsPlaying(false)
        },
      }))
    
      const handlePlayClick = () => {
        onPlayClicked() // tells parent to broadcast play command
      }
    
      const handlePauseClick = () => {
        internalRef.current.audio.current.pause()
        setIsPlaying(false)
      }
    
      const handleRestart = () => {
        internalRef.current.audio.current.currentTime = 0
      }
    
      return (
        <div className="mt-4 flex flex-col items-center gap-3">
          <AudioPlayer
            ref={internalRef}
            src={stableAudioUrl}
            style={{ pointerEvents: 'none' }}
            showJumpControls={false}
            customControlsSection={[]}
            customAdditionalControls={[]}
            customVolumeControls={[]}
          />
    
        {isHost ? 
          <div className="flex gap-2">
            {!isPlaying ? (
              <button
                disabled={isCountingDown}
                onClick={handlePlayClick}
                className="bg-green-500 text-white px-3 py-2 rounded min-w-24"
              >
                <div className="flex flex-row">
                  <Play />
                  <div className="w-2" />
                  <h2>Play</h2>
                </div>
              </button>
            ) : (
              <button
                onClick={handlePauseClick}
                className="bg-red-500 text-white px-3 py-2 rounded min-w-24"
              >
                <div className="flex flex-row">
                  <Pause />
                  <div className="w-2" />
                  <h2>Pause</h2>
                </div>
              </button>
            )}
    
            <button
              disabled={isCountingDown}
              onClick={handleRestart}
              className="bg-green-500 text-white px-3 py-2 rounded"
            >
              <div className="flex flex-row">
                <RefreshCw />
                  <div className="w-2" />
                  <h2>Restart</h2>
                </div>
              </button>
            </div> : null
        }
        </div>
      )
    }

  export default AudioPlayerComponent;