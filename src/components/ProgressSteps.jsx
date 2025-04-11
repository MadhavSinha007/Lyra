import React from 'react';

const ProgressSteps = ({ currentStep }) => {
  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-100 z-0">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-in-out" 
              style={{ width: `${(currentStep - 1) * 50}%` }}
            ></div>
          </div>
          
          {/* Steps */}
          <div className="flex justify-between relative z-10">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${currentStep > stepNumber ? 'bg-gradient-to-br from-blue-500 to-purple-500 border-transparent text-white' : 
                  currentStep === stepNumber ? 'bg-white border-blue-500 text-blue-500' : 
                  'bg-white border-gray-200 text-gray-400'}`}>
                  {stepNumber}
                </div>
                <div className={`mt-2 text-xs font-medium transition-all duration-300
                  ${currentStep >= stepNumber ? 'text-blue-600' : 'text-gray-400'}`}>
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