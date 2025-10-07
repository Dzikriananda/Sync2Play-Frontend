function LoadingComponent() {
    return (
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"> 
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"/> 
      </div>
    );
}

export default LoadingComponent;

