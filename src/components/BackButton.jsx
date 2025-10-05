function BackButton({ onClick }) {

  
    return (
      <button
        onClick={onClick}
        className="absolute top-4 left-4 bg-white rounded-full shadow-md px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 transition z-20"
        aria-label="Back"
      >
        ← Back
      </button>
    );
  }
export default BackButton;