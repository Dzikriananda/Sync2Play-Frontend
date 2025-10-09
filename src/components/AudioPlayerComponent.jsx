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
      const [serverOffset, setServerOffset] = useState(0);


      const playerRef = useRef(null);

      useEffect(() => {
        if(data.hostToken != null){
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      },[]);

    
      function handlePlayCommand(startServerTime) {
        setIsIsCountingDown(true);
      
        const localStartTime = startServerTime - serverOffset;
      
        const now = Date.now();
        let delay = localStartTime - now;
      
        console.log(`before Audio will play in ${delay.toFixed(0)} ms`);
        if(isDesktopOS()) {
          delay += 600; //Delay karena entah kenapa di windows mulainya selalu dluan, range 500-600 u/ delay
        }
        console.log(`after Audio will play in ${delay.toFixed(0)} ms`);

        
        if (delay > 0) {
          setTimeout(() => {
            setIsIsCountingDown(false);
            playerRef.current?.playAudio(); // Play directly
          }, delay);
        } else {
          // If we're already late, play immediately
          setIsIsCountingDown(false);
          playerRef.current?.playAudio();
        }
      }
      

      function isDesktopOS(userAgent = navigator.userAgent, width = window.innerWidth) {
        const ua = userAgent.toLowerCase();
        const isMobileUA = /mobile|android|iphone|ipad|ipod|tablet/i.test(ua);
        const isWideScreen = width > 768;
        const isDesktopUA = ua.includes('windows nt') || ua.includes('mac os x') || ua.includes('linux');
    
        return isWideScreen && !isMobileUA && isDesktopUA;
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
          calibrateOffset(socket, setServerOffset);

        }
    
        function onDisconnect() {
          setIsConnected(false);
        }
    
        async function onEvent(value) {
          console.log(value);
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

      function sendPlayCommand() {
        socket.emit('play',data.hostToken);
      }

      function sendPauseCommand() {
        socket.emit('pause',data.hostToken);
      }

      async function calibrateOffset(socket, setServerOffset) {
        function measureOffset() {
          return new Promise((resolve) => {
            const clientSend = Date.now();
            socket.emit("ping", clientSend);
            socket.once("pong", (serverTime, clientSendBack) => {
              const clientReceive = Date.now();
              const rtt = clientReceive - clientSendBack;
              const latency = rtt / 2;
              const estimatedServerTime = serverTime + latency;
              resolve(estimatedServerTime - clientReceive);
            });
          });
        }
      
        const samples = [];
        for (let i = 0; i < 15; i++) {
          samples.push(await measureOffset());
          await new Promise((r) => setTimeout(r, 50));
        }
      
        samples.sort((a, b) => a - b);
        const trimmed = samples.slice(3, samples.length - 3); // throw away outliers
        const avg =
          trimmed.reduce((a, b) => a + b, 0) / (trimmed.length || samples.length);
      
        setServerOffset(avg);
        console.log("🧭 Calibrated offset:", avg, "ms");
      }

      // useEffect(() => {
      //   let offsets = [];
      //   let sampleCount = 0;
      //   const totalSamples = 10;
      
      //   function takeSample() {
      //     const clientSend = Date.now();
      //     socket.emit("ping", clientSend);
      
      //     socket.once("pong", (serverTime, clientSendBack) => {
      //       const clientReceive = Date.now();
      //       const roundTrip = clientReceive - clientSendBack;
      //       const latency = roundTrip / 2;
      //       const estimatedServerTime = serverTime + latency;
      //       const offset = estimatedServerTime - clientReceive;
      
      //       offsets.push(offset);
      //       sampleCount++;
      
      //       if (sampleCount < totalSamples) {
      //         setTimeout(takeSample, 50); // short gap between samples
      //       } else {
      //         // Median to reduce outlier impact
      //         offsets.sort((a, b) => a - b);
      //         const medianOffset = offsets[Math.floor(offsets.length / 2)];
      //         setServerOffset(medianOffset);
      //         console.log("✅ Final serverOffset:", medianOffset, "ms");
      //       }
      //     });
      //   }
      
      //   // Initial sync
      //   takeSample();
      
      //   // Re-sync every 10s
      //   const interval = setInterval(() => {
      //     offsets = [];
      //     sampleCount = 0;
      //     takeSample();
      //   }, 10000);
      
      //   return () => {
      //     clearInterval(interval);
      //   };
      // }, []);
      

      

    
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
            <CustomAudioPlayer playerRef={playerRef} audioUrl={audioUrl} onPlayClicked={sendPlayCommand} onPauseClicked={sendPauseCommand} isCountingDown={isCountingDown} isHost={isHost}/>
            <div className="w-full h-[1px] bg-gray-300/70 rounded-full mt-2 mb-1" />
            {(isCountingDown) ? 
              <div className="flex justify-center items-center mt-4">
                  <OrbitProgress color="#32cd32" size="large" text="SENDING.." textColor="" />
              </div>
              : null
            }
            <h2 className='text-center break-all whitespace-normal'>Now Playing {file.name}</h2>
          </motion.div>
        </div>
    
      );
    };

    function CustomAudioPlayer({ playerRef, audioUrl, onPlayClicked, onPauseClicked,isCountingDown,isHost}) {

      const audioRef = useRef(audioUrl); // store the initial URL
      const internalRef = useRef(null)
      const [isPlaying, setIsPlaying] = useState(false)
      const stableAudioUrl = audioRef.current; // use this in your AudioPlayer
    
      // ✅ Expose control methods to parent
      useImperativeHandle(playerRef, () => ({
        playAudio() {
          console.log('play called');
          internalRef.current.audio.current.play()
          setIsPlaying(true)
        },
        pauseAudio() {
          console.log('pause called');
          internalRef.current.audio.current.pause()
          setIsPlaying(false)
        },
      }))

      const unlockAudio = () => {
        const audio = internalRef.current?.audio.current;
        if (audio) {
          if(audio.currentTime === 0) { //Agar tidak kereset ketika resume dari pause
            const originalVolume = audio.volume;
            audio.volume = 0;
        
            try {
              const playPromise = audio.play();
              if (playPromise !== undefined) {
                // 👉 Immediately schedule a pause on the next tick
                setTimeout(() => {
                  audio.pause();
                  audio.currentTime = 0;
                  audio.volume = originalVolume;
                  console.log("✅ iOS audio unlocked (forced immediate pause)");
                }, 0);
              }
            } catch (err) {
              console.log("unlock error:", err);
            }
          }
        }
      };
      
      
      
    
      const handlePlayClick = () => {
        onPlayClicked() // tells parent to broadcast play command
      }
    
      const handlePauseClick = () => {
        onPauseClicked();
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