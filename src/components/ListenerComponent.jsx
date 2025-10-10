import { AnimatePresence, motion } from 'framer-motion';
import EnterCodeComponent from './EnterCodeComponent';
import AudioPlayerComponent from './AudioPlayerComponent';
import { useState } from 'react';

export default function ListenerComponent() {
  const [isMediaReady, setIsMediaReady] = useState(false);
  const [file, setFile] = useState(null);
  const [code, setCode] = useState("");

  function onMediaDownloaded(code, file) {
    setCode(code);
    // setFile(file);
    const parsedFile = new File([file], `andai aku bisa.mp3`, { type: file.type });
    setFile(parsedFile);
    setIsMediaReady(true);
  }

  return (
    <div>
      <AnimatePresence mode="wait">
        {isMediaReady ? (
          <motion.div
            key="audio"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <AudioPlayerComponent data={{ hostToken: null, sessionId: code }} file={file} />
          </motion.div>
        ) : (
          <motion.div
            key="enter"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4 }}
          >
            <EnterCodeComponent onMediaDownloaded={onMediaDownloaded} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
