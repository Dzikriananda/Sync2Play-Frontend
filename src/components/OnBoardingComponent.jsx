function OnBoardingComponent({onRoleClick}) {
    return (
      <div className='md:min-w-96  h-full bg-white rounded-2xl shadow-2xs p-8'>
        <h1 className='text-3xl font-extrabold text-gray-800'>Welcome to Sync2Play </h1>
        <h2 className=' text-gray-500 mt-2 text-xl mb-16'>Are you the host or the listener?</h2>
        <div className='flex flex-row'>
        <div className='w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50' onClick={() => onRoleClick('host')}>
            Host
          </div>
          <div className='w-3'/>
          <div className='w-full flex justify-center items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50' onClick={() => onRoleClick('listener')}>
            Listener
          </div>
        </div>
        <h2 className=' text-blue-500 mt-2 text-lg '>Choose the role to continue</h2>
      </div>
    );
}

export default OnBoardingComponent;
