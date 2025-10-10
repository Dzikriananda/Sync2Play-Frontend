  import { useState,useRef,useEffect,useImperativeHandle, useMemo } from 'react'
  import { motion, AnimatePresence } from 'framer-motion';
  import AudioPlayer from 'react-h5-audio-player';
  import 'react-h5-audio-player/lib/styles.css';
  import { Play,Pause, RefreshCw } from 'lucide-react';
  import { socket } from '../socket';
  import { OrbitProgress} from 'react-loading-indicators';
  import LoadingComponent from './LoadingComponent';
  import CustomAlertDialog from './AlertDialog';

  const AudioPlayerComponent = ({data,file}) => {

      const audioUrl = URL.createObjectURL(file);
      const [isCountingDown, setIsIsCountingDown] = useState(false);
      const [isConnected, setIsConnected] = useState(socket.connected);
      const [isHost,setIsHost] = useState(false);
      // const [serverOffset, setServerOffset] = useState(0);
      const serverOffsetRef = useRef(0);
      const [isIOS,setIsIOS] = useState(false);

      const playerRef = useRef(null);

      useEffect(() => {
        console.log('file perel brown : ' + file);
      },[]);

      useEffect(() => {
        if(data.hostToken != null){
          setIsHost(true);
        } else {
          setIsHost(false);
        }
      },[]);

      function handlePlayCommand(startServerTime) {
        setIsIsCountingDown(true);
      
        const offset = serverOffsetRef.current;
        const localStartTime = startServerTime - offset;
        const now = Date.now();
        let delay = localStartTime - now;
      
        console.log({
          startServerTime,
          serverOffset: offset,
          localStartTime,
          now,
          delay
        });
        console.log(`offset in the handlePlayCommand ${offset.toFixed(0)} ms`);
      
        if (delay > 0) {
          setTimeout(() => {
            setIsIsCountingDown(false);
            playerRef.current?.playAudio();
          }, delay);
        } else {
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

      function checkIfIsIOS() {
        const ua = navigator.userAgent;
        const os =  /iphone|ipod|ipad/i.test(ua) ||(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        console.log('device is ios : ' +  os);
        setIsIOS(os);
      }
      


      function handlePauseCommand() {
        playerRef.current?.pauseAudio(); // call child’s pause
      }

      function handleRestartCommand() {
        playerRef.current?.restartAudio(); // call child’s restart
      }

      

      useEffect(() => {
        socket.connect();
    
        return () => {
          socket.disconnect();
        };
      }, []);

      useEffect(() => {
        async function onConnect() {
          checkIfIsIOS();
          setTimeout(() => {}, 2000);
          setIsConnected(true);
          await calibrateOffset(socket, serverOffsetRef);
          socket.emit('join-session', data.sessionId);
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
          } else if (command === 'pause') {
            handlePauseCommand();
          } else {
            handleRestartCommand();
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

      function sendRestartCommand() {
        socket.emit('restart',data.hostToken);
      }

      async function calibrateOffset(socket, serverOffsetRef) {
        function measureOnce() {
          return new Promise((resolve) => {
            const t1 = Date.now();
            socket.emit("ping", t1);
      
            socket.once("pong", ({ clientSendTime: t1_serverSent, serverReceiveTime: t2, serverSendTime: t3 }) => {
              const t4 = Date.now();     // clientReceive
              const t1 = t1_serverSent;  // clientSend (echoed back)
              const rtt = (t4 - t1) - (t3 - t2);
              const offset = ((t2 - t1) + (t3 - t4)) / 2;
            
              const estimatedServerSend = t4 + offset; // what client's clock thinks server time is now
              console.log({
                t1, t2, t3, t4,
                rtt,
                offset,
                estimatedServerSend,
                serverSendTime: t3,
                est_diff_ms: (estimatedServerSend - t3).toFixed(2) // should be ~0
              });
            
              resolve({ offset, RTT: rtt });
            });
            
          });
        }
      
        const samples = [];
        const N = 15; // number of pings
      
        for (let i = 0; i < N; i++) {
          samples.push(await measureOnce());
          await new Promise((r) => setTimeout(r, 50));
        }
      
        console.table(samples);
      
        // Keep the lowest RTTs (best samples)
        samples.sort((a, b) => a.RTT - b.RTT);
        const best = samples.slice(0, Math.max(3, Math.floor(N * 0.15)));
        const avgOffset = best.reduce((sum, s) => sum + s.offset, 0) / best.length;
      
        serverOffsetRef.current = avgOffset;
        console.log(`offset when calibrate (maybe not updated yet as part of how reacts work)${serverOffsetRef.current.toFixed(0)} ms`);
        console.log("🧭 Final serverOffset (best RTT avg):", avgOffset.toFixed(2), "ms");
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
            <CustomAudioPlayer playerRef={playerRef} audioUrl={audioUrl} onPlayClicked={sendPlayCommand} onPauseClicked={sendPauseCommand} onRestartClicked={sendRestartCommand} isCountingDown={isCountingDown} isHost={isHost} isIOS={isIOS}/>
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

    function CustomAudioPlayer({ playerRef, audioUrl, onPlayClicked, onPauseClicked,onRestartClicked,isCountingDown,isHost,isIOS}) {

      const audioRef = useRef(audioUrl); // store the initial URL
      const internalRef = useRef(null)
      const [isPlaying, setIsPlaying] = useState(false)
      const [isSoundUnlocked,setIsSoundUnlocked] = useState(false);
      const stableAudioUrl = audioRef.current; // use this in your AudioPlayer
      const [showDialog, setShowDialog] = useState(false);
      const [showIOSSoundPrepLoading,setIOSSoundPrepLoading] = useState(false);

      useEffect(()=> {
        console.log('audio url  : ' + audioUrl);
        console.log('internal ref  :   '+ internalRef); 
        console.log('stable url  : ' + stableAudioUrl); 
        console.log('')

      },[])

      // ✅ Expose control methods to parent
      useImperativeHandle(playerRef, () => ({
        playAudio() {
          internalRef.current.audio.current.play()
          setIsPlaying(true)
        },
        pauseAudio() {
          console.log('pause called');
          internalRef.current.audio.current.pause()
          setIsPlaying(false)
        },
        restartAudio() {
          internalRef.current.audio.current.currentTime = 0
        }
      }))

      useEffect(() => {
        if (isIOS) {
          setShowDialog(true); // open the dialog automatically
        }
      }, [isIOS]);
      

      // const unlockAudio = async () => {
      //   const audio = internalRef.current?.audio.current;
      //   if (audio) {
      //     if(audio.currentTime === 0) { //Agar tidak kereset ketika resume dari pause
      //       const originalVolume = audio.volume;
      //       audio.volume = 0;
        
      //       try {
      //         const playPromise = audio.play();
      //         if (playPromise !== undefined) {
      //           // 👉 Immediately schedule a pause on the next tick
      //           setTimeout(() => {
      //             audio.pause();
      //             audio.currentTime = 0;
      //             audio.volume = originalVolume;
      //             console.log("✅ iOS audio unlocked (forced immediate pause)");
      //           }, 0);
      //         }
      //       } catch (err) {
      //         console.log("unlock error:", err);
      //       }
      //     }
      //   }
      // };

      // useEffect(() => {

      // },[])
      
      // const unlockAudio = async () => {
      //   setIOSSoundPrepLoading(true);
      //   const audio = internalRef.current?.audio.current;
      //   if (!audio) return;

      //   if (!audio.src || audio.src.length === 0) {
      //     console.warn("Audio src not set yet. Skipping unlock.");
      //     return;
      //   }
      //   if (!audio || !document.body.contains(audio)) {
      //     console.warn("Audio element not attached to DOM yet");
      //     return;
      //   }        
      
      //   if (audio.currentTime === 0) {
      //     try {
      //       // Use muted instead of volume for better Safari behavior
      //       console.log('0');
      //       audio.muted = true;
      //       console.log('state : ' + audio.readyState);
      //       if (audio.readyState < 1) {
      //         console.log('not ready')
      //         await new Promise((resolve) => {
      //           audio.addEventListener('loadedmetadata', resolve, { once: true });
      //         });
      //       }


      //       // Start playback — this must happen inside a user gesture
      //       await audio.play();
      //       console.log('2');
      //       console.log('🔓 Silent playback started for unlock');
      
      //       // Give Safari a tiny moment to actually start before stopping
      //       await new Promise((resolve) => setTimeout(resolve, 500));
      //       console.log('3');
      
      //       audio.pause();
      //       console.log('4');
      //       audio.currentTime = 0;            
      //       console.log('5');

      //       audio.muted = false;
      //       console.log('6');
      
      //       // Force Safari to fully reset the buffer position
      //       audio.load();
      //       console.log('7');

      //       setIsSoundUnlocked(true);
      //       setIOSSoundPrepLoading(false);
      //       console.log('8');

      //       console.log('✅ iOS audio unlocked and reset cleanly');
      //     } catch (err) {
      //       console.log('unlock error:', err);
      //     }
      //   }
      // };

      const unlockAudio = async () => {
        setIOSSoundPrepLoading(true);
        const audio = internalRef.current?.audio.current;
        if (!audio) return;
      
        if (!audio.src || audio.src.length === 0) {
          console.warn("Audio src not set yet. Skipping unlock.");
          setIOSSoundPrepLoading(false);
          return;
        }
        if (!document.body.contains(audio)) {
          console.warn("Audio element not attached to DOM yet");
          setIOSSoundPrepLoading(false);
          return;
        }
      
        try {
          console.log('[unlock] start');
      
          // ✅ Make sure preload is enabled
          audio.preload = 'auto';
      
          // ✅ Wait until metadata is available
          if (audio.readyState < 1) {
            console.log('[unlock] waiting for metadata...');
            await new Promise((resolve, reject) => {
              const onMeta = () => {
                console.log('[unlock] metadata loaded');
                resolve();
              };
              audio.addEventListener('loadedmetadata', onMeta, { once: true });
              // Safety timeout
              setTimeout(() => reject(new Error('Timeout waiting for metadata')), 5000);
            });
          }
      
          // ✅ Extra step for iOS: force buffering a bit
          await new Promise((resolve) => setTimeout(resolve, 300));
      
          // ✅ Mute before unlock
          audio.muted = true;
          console.log('[unlock] calling play()');
          const playPromise = audio.play();
      
          if (playPromise !== undefined) {
            await playPromise;
          }
      
          console.log('[unlock] playback started (muted)');
          await new Promise((resolve) => setTimeout(resolve, 400));
      
          audio.pause();
          audio.currentTime = 0;
          audio.muted = false;
          audio.load(); // force reset
          setIsSoundUnlocked(true);
          console.log('[unlock] ✅ finished');
        } catch (err) {
          console.log('[unlock] error', err);
        } finally {
          setIOSSoundPrepLoading(false);
        }
      };
      
      
      
      
      
    
      const handlePlayClick = async () => {
        onPlayClicked() // tells parent to broadcast play command
      }
    
      const handlePauseClick = () => {
        onPauseClicked();
      }
    
      const handleRestart = () => {
        onRestartClicked();
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
          {
          (isIOS) ?  
            <CustomAlertDialog
              open={showDialog}
              onClose={() => setShowDialog(false)}
              onPressed={unlockAudio}
              title="Enable Audio Playback"
              content="Tap “Allow” so your browser can play music automatically."
              buttonTitle="Allow"
              isLoading={showIOSSoundPrepLoading}
            />
            : null
          }
        </div>
        
      )
    }

  export default AudioPlayerComponent;