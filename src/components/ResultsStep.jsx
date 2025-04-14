import React from 'react';
import { Heart, Music, Tag, RefreshCw } from 'lucide-react';

const ResultsStep = ({
  aiResponse,
  breathingExercises,
  spotifyRecommendations,
  resetApp
}) => {
  return (
    <div className="bg-black text-white min-h-screen w-full p-4 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-12 text-white text-center pt-8 relative inline-block group">
          Your Wellness Recommendations
          <span className="block h-0.5 w-0 bg-white mt-1 transition-all duration-500 group-hover:w-full mx-auto"></span>
        </h2>

        {/* Emotional Analysis Section */}
        <div className="mb-12 p-8 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-2xl transition-all duration-500 group hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
          <h3 className="font-semibold mb-4 text-2xl flex items-center text-white relative group">
            <span className="mr-3 bg-white rounded-full p-2 flex items-center justify-center text-black">
              🧠
            </span>
            Emotional Analysis
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-500 group-hover:w-full"></span>
          </h3>
          <p className="leading-relaxed text-lg text-white/80 relative z-10">{aiResponse}</p>
        </div>

        {/* Breathing Exercises Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-semibold mb-8 flex items-center text-white relative group">
            <Heart className="mr-4 p-2 rounded-full bg-white/10 border border-white/20" size={32} />
            Breathing Exercises
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-500 group-hover:w-full"></span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {breathingExercises.map((exercise, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10 shadow-xl transition-all duration-700 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
                <h4 className="font-bold text-2xl mb-3 text-white relative z-10 group-hover:underline underline-offset-4">{exercise.name}</h4>
                <div className="mb-4 text-sm inline-block bg-white/10 text-white px-4 py-1.5 rounded-full font-medium shadow-lg relative z-10">
                  {exercise.benefitsFor}
                </div>
                <ul className="mt-6 space-y-4 relative z-10">
                  {exercise.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="flex-shrink-0 h-7 w-7 rounded-full bg-white text-black flex items-center justify-center mr-3 font-bold text-sm shadow-md">{idx + 1}</span>
                      <span className="text-base text-white/90">{step}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm font-medium flex items-center text-white/70 relative z-10">
                  <span className="inline-block h-4 w-4 bg-white rounded-full mr-2"></span>
                  {exercise.duration}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Music Recommendations Section */}
        <div className="mb-16">
          <h3 className="text-3xl font-semibold mb-8 flex items-center text-white relative group">
            <Music className="mr-4 p-2 rounded-full bg-white/10 border border-white/20" size={32} />
            Music Recommendations
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-500 group-hover:w-full"></span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {spotifyRecommendations.map((song, index) => (
              <a
                key={index}
                href={song.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-md bg-white/5 border border-white/10 shadow-xl transition-all duration-500 hover:scale-[1.03] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
                <h4 className="font-bold text-xl mb-3 text-white relative z-10 group-hover:underline underline-offset-4 line-clamp-2">{song.name}</h4>
                <div className="flex flex-wrap items-center gap-3 mt-4 relative z-10">
                  <span className="bg-white/10 text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-md">
                    {song.genre}
                  </span>
                  {song.mood && (
                    <span className="bg-white/10 border border-white/20 text-white text-sm px-3 py-1.5 rounded-full flex items-center font-medium shadow-md backdrop-blur-sm">
                      <Tag className="h-3.5 w-3.5 mr-1.5" />
                      {song.mood}
                    </span>
                  )}
                </div>
                <div className="mt-8 flex items-center text-sm font-medium text-white/70 group-hover:text-white relative z-10 transition-colors">
                  <Music className="mr-3 h-5 w-5 text-white" />
                  <span className="underline underline-offset-4">Open in Spotify →</span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-12 mb-16 flex justify-center">
          <button
            onClick={resetApp}
            className="px-10 py-4 bg-white/10 text-white rounded-full font-semibold flex items-center shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 text-lg"
          >
            <RefreshCw className="mr-3 h-5 w-5 animate-spin-slow group-hover:animate-spin" />
            Start New Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;
