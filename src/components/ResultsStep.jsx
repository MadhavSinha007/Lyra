import React from 'react';
import { Heart, Music, Tag, RefreshCw } from 'lucide-react';

const ResultsStep = ({
  aiResponse,
  breathingExercises,
  spotifyRecommendations,
  resetApp
}) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-screen w-full p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-indigo-900 text-center pt-6">Your Wellness Recommendations</h2>
        
        {/* Emotional Analysis Section */}
        <div className="mb-10 p-6 bg-white rounded-xl shadow-lg border-l-4 border-blue-500 transition-all duration-300 hover:shadow-xl transform hover:scale-[1.01]">
          <h3 className="font-semibold text-blue-900 mb-3 text-xl flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Emotional Analysis
          </h3>
          <p className="text-gray-800 leading-relaxed text-lg">{aiResponse}</p>
        </div>
        
        {/* Breathing Exercises Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 flex items-center text-indigo-900">
            <Heart className="mr-3 text-pink-600" size={24} fill="rgba(219, 39, 119, 0.2)" /> 
            <span className="border-b-2 border-pink-400 pb-1">Breathing Exercises</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {breathingExercises.map((exercise, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="relative">
                  <div className="absolute top-0 right-0 h-16 w-16 bg-teal-100 opacity-20 rounded-bl-full"></div>
                  <h4 className="font-bold text-teal-700 text-xl mb-2">{exercise.name}</h4>
                  <div className="mb-4 text-sm inline-block bg-teal-500 text-white px-3 py-1 rounded-full font-medium">
                    {exercise.benefitsFor}
                  </div>
                  <ul className="mt-4 space-y-3">
                    {exercise.steps.map((step, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mr-3 font-bold text-sm">{idx+1}</span> 
                        <span className="text-base">{step}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-sm text-teal-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {exercise.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Music Recommendations Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 flex items-center text-indigo-900">
            <Music className="mr-3 text-purple-600" size={24} /> 
            <span className="border-b-2 border-purple-400 pb-1">Music Recommendations</span>
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {spotifyRecommendations.map((song, index) => (
              <a
                key={index}
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden bg-white rounded-xl p-5 transition-all duration-500 block shadow-lg hover:shadow-xl hover:-translate-y-2 border border-gray-100"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 bg-purple-100 opacity-20 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-purple-700 line-clamp-2">{song.name}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="bg-purple-500 text-white text-sm px-3 py-1 rounded-full font-medium shadow-sm">
                    {song.genre}
                  </span>
                  {song.mood && (
                    <span className="bg-indigo-500 text-white text-sm px-3 py-1 rounded-full flex items-center font-medium shadow-sm">
                      <Tag className="h-3 w-3 mr-1" />
                      {song.mood}
                    </span>
                  )}
                </div>
                <div className="mt-6 flex items-center text-sm text-purple-600 font-medium group-hover:text-purple-700">
                  <Music className="mr-2 h-4 w-4" /> 
                  <span className="relative">
                    Open in Spotify
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500 group-hover:w-full transition-all duration-300"></span>
                  </span>
                  <span className="ml-1 transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </div>
              </a>
            ))}
          </div>
        </div>
        
        {/* Reset Button */}
        <div className="mt-8 mb-12 flex justify-center">
          <button
            onClick={resetApp}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium flex items-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:from-indigo-600 hover:to-purple-600 text-lg"
          >
            <RefreshCw className="mr-2 h-5 w-5" /> Start New Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;