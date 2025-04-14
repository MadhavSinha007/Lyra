// services/geminiApi.js
const EMOTIONS = [
  'happy', 'sad', 'angry', 'neutral', 'surprised', 'fearful',
  'disgusted', 'anxious', 'content', 'excited', 'calm', 'tired',
  'bored', 'confused', 'disappointed', 'frustrated', 'proud',
  'relieved', 'grateful', 'overwhelmed'
];

const analyzeImageWithGemini = async (base64Data, setError) => {
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analyze this facial expression. Respond ONLY with one word from this list: happy, sad, angry, neutral, surprised, fearful, disgusted, anxious, content, excited, calm, tired, bored, confused, disappointed, frustrated, proud, relieved, grateful, overwhelmed." },
            { inlineData: { mimeType: "image/jpeg", data: base64Data } }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
      throw new Error("Invalid response format from Gemini API");
    }

    const emotionText = data.candidates[0].content.parts[0].text.toLowerCase().trim();
    for (const emotion of EMOTIONS) {
      if (emotionText.includes(emotion)) {
        return emotion;
      }
    }
    return 'neutral'; // Default if no match found
  } catch (error) {
    setError(`Emotion analysis failed: ${error.message}`);
    return null;
  }
};

const submitTextForAnalysis = async (emotion, text, setError) => {
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    const promptText = `
Analyze this emotional state:
- Visual emotion: ${emotion || 'unknown'}
- User description: "${text}"

Provide a response in the following JSON format ONLY with no additional text:
{
  "message": "A supportive message (1-2 sentences)",
  "breathingExercises": [
    {
      "name": "Exercise name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "duration": "Duration information",
      "benefitsFor": "Specific emotional benefit"
    },
    {
      "name": "Second exercise name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "duration": "Duration information",
      "benefitsFor": "Specific emotional benefit"
    },
    {
      "name": "Third exercise name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "duration": "Duration information",
      "benefitsFor": "Specific emotional benefit"
    },
    {
      "name": "Fourth exercise name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "duration": "Duration information",
      "benefitsFor": "Specific emotional benefit"
    }
  ],
  "musicRecommendations": [
    {
      "title": "Song title 1",
      "artist": "Artist name",
      "genre": "Genre",
      "mood": "The mood this song helps with"
    },
    {
      "title": "Song title 2",
      "artist": "Artist name",
      "genre": "Genre",
      "mood": "The mood this song helps with"
    },
    {
      "title": "Song title 3",
      "artist": "Artist name",
      "genre": "Genre",
      "mood": "The mood this song helps with"
    },
    {
      "title": "Song title 4",
      "artist": "Artist name",
      "genre": "Genre",
      "mood": "The mood this song helps with"
    },
    {
      "title": "Song title 5",
      "artist": "Artist name",
      "genre": "Genre",
      "mood": "The mood this song helps with"
    }
  ]
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.status}`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0]?.content?.parts?.length) {
      throw new Error("Invalid response format from Gemini API");
    }

    const responseText = data.candidates[0].content.parts[0].text;
    let jsonMatch = responseText.match(/(\{[\s\S]*\})/);
    if (!jsonMatch) {
      throw new Error("Could not find valid JSON in the response");
    }

    const jsonString = jsonMatch[0];
    const parsedResults = JSON.parse(jsonString);
    
    // Transform song recommendations to match the expected format for component rendering
    const transformedResults = {
      ...parsedResults,
      spotifyRecommendations: parsedResults.musicRecommendations.map(song => ({
        name: `${song.title} - ${song.artist}`,
        genre: song.genre,
        mood: song.mood,
        url: `https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${song.artist}`)}`
      }))
    };
    
    return transformedResults;
  } catch (error) {
    setError(`Error processing your request: ${error.message}`);
    return null;
  }
};

export { analyzeImageWithGemini, submitTextForAnalysis, EMOTIONS };