import { useState,useRef } from 'react'

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

export default CustomAudioPlayer;