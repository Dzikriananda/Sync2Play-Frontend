import React, { useState, useEffect } from 'react';
import { socket } from '../socket'

export default function ListenerComponent() {
  const [code, setCode] = useState("");

  function handleChange(e) {
    const value = e.target.value;
    if (value.length <= 6) {
      setCode(value);
    }
  }
  

  // const [isConnected, setIsConnected] = useState(socket.connected);

  // useEffect(() => {
  //   function onConnect() {
  //     setIsConnected(true);
  //   }

  //   function onDisconnect() {
  //     setIsConnected(false);
  //   }

  //   socket.on('connect', onConnect);
  //   socket.on('disconnect', onDisconnect);

  //   return () => {
  //     socket.off('connect', onConnect);
  //     socket.off('disconnect', onDisconnect);
  //   };
  // }, []);

  return (
    <div className='min-w-96 min-h-64 bg-white rounded-2xl shadow-2xs p-8'>
     
      <h1 className='text-3xl font-extrabold text-gray-800'>Sync2Play</h1>
      <h2 className=' text-gray-500 mt-2'>Enter a Host Code consisted of 6 Characters</h2>
      <h2 className=' text-gray-700 font-medium text-sm mt-6'>Host Code</h2>
      <input className='mt-1 rounded-lg w-full h-9 px-2 border-1 border-gray-300 shadow-md' type="text" placeholder='e.g., GS8aF' value={code} onChange={(val) => handleChange(val)} maxLength={6}/>
      <div className='mt-8 w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50' >
        Enter
      </div>
      {/* {(false) ? <CustomAudioPlayer/> : null} */}      
    </div>
  );
}

