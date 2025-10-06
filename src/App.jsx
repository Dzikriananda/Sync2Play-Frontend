import { useState,useRef,useEffect,useCallback } from 'react'
import { AnimatePresence, motion } from "framer-motion";
import * as React from 'react';
import bg from './assets/bg.jpg';
import OnBoardingComponent from './components/OnBoardingComponent';
import ListenerComponent from './components/ListenerComponent';
import BackButton from './components/BackButton';
import AudioPlayerComponent from './components/AudioPlayerComponent';
import HostAudioPrepComponent from './components/HostAudioPrepComponent';
import HostComponent from './components/HostComponent';
function App() {
  const [userRole,setUserRole] = useState(null);

  const handleChooseRoleClick = (role) => {
    addDummyPage();
    setUserRole(role);
  };
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  useEffect(() => {
    if (isIOS) {
      const preventSwipe = (e) => {
        if (e.touches[0].pageX < 30) {
          e.preventDefault(); // Block left-edge swipe navigation
        }
      };

      document.addEventListener("touchstart", preventSwipe, { passive: false });

      return () => {
        document.removeEventListener("touchstart", preventSwipe);
      };
    }
  },[]);

  const handleBackClickForIphone = useCallback(() => {
    setUserRole(null);
    window.history.pushState(null, "", window.location.href);
  },[]);

  
  let content;
  if(userRole === 'host') {
    content = <HostComponent/>
    // content = <HostAudioPrepComponent onBackForIphone={handleBackClickForIphone} isIOS={isIOS}/>
    // content = <AudioPlayerComponent/>
  } else if (userRole === 'listener') {
    content = <ListenerComponent onBackForIphone={handleBackClickForIphone} isIOS={isIOS}/>
  } else {
    content = <OnBoardingComponent onRoleClick={handleChooseRoleClick} />
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
    <div className='h-dvh w-screen  flex justify-center items-center p-4 md:p-0'>
        <img
          src={bg}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
       />
        {
          userRole != null && isIOS && (
            <BackButton onClick={handleBackClickForIphone} />
          )
        }
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







export default App
