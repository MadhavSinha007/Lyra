import React from 'react';

const ProgressSteps = ({ currentStep }) => {
  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="relative">
          {/* Progress Track */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-700 z-0 rounded-full">
            <div 
              className="h-full bg-white transition-all duration-500 ease-in-out rounded-full" 
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="flex justify-between relative z-10">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${currentStep > stepNumber 
                    ? 'bg-white text-black border-white' 
                    : currentStep === stepNumber 
                      ? 'bg-black text-white border-white' 
                      : 'bg-black text-white border-gray-500 opacity-40'}`}>
                  {stepNumber}
                </div>
                <div className={`mt-2 text-xs font-medium transition-all duration-300
                  ${currentStep >= stepNumber ? 'text-white' : 'text-white opacity-40'}`}>
                  {stepNumber === 1 ? 'Capture' : stepNumber === 2 ? 'Describe' : 'Results'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSteps;
