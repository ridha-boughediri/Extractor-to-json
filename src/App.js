import React, { useState } from 'react';
import axios from 'axios';
import Tesseract from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';

// Définir le chemin du worker
GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdfjs/pdf.worker.js`;

function App() {
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    setLoading(true);
    const fileType = file.type;

    if (fileType.startsWith('image/')) {
      // Utiliser Tesseract.js pour extraire le texte d'une image
      Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => console.log(m),
        }
      ).then(({ data: { text } }) => {
        analyzeTextWithOpenAI(text.trim(), file);
      }).catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
    } else if (fileType === 'application/pdf') {
      // Utiliser pdfjs-dist pour extraire le texte d'un PDF
      const reader = new FileReader();
      reader.onload = async function() {
        try {
          const pdfData = new Uint8Array(reader.result);
          const pdf = await getDocument({ data: pdfData }).promise;
          let extractedText = '';
          for (let i = 0; i < pdf.numPages; i++) {
            const page = await pdf.getPage(i + 1);
            const textContent = await page.getTextContent();
            const textItems = textContent.items.map(item => item.str).join(' ');
            extractedText += textItems + ' ';
          }
          analyzeTextWithOpenAI(extractedText.trim(), null);
        } catch (error) {
          console.error('Error:', error);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const analyzeTextWithOpenAI = async (text, file) => {
    try {
      const prompt = `Based on the following text, extract the product name, price, color, and identify the nature of the product: ${text}`;
      let response = await makeOpenAIRequest({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      });

      const resultText = response.data.choices[0].message.content.trim();
      const resultJson = {
        productName: extractValue(resultText, 'Product Name'),
        price: extractValue(resultText, 'Price'),
        color: extractValue(resultText, 'Color'),
        nature: extractValue(resultText, 'Nature'),
      };

      if (file) {
        const imageNature = await analyzeImage(file);
        resultJson.nature = resultJson.nature || imageNature;
      }

      setJsonData(resultJson);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeOpenAIRequest = async (data) => {
    const maxRetries = 5;
    let retryCount = 0;
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    while (retryCount < maxRetries) {
      try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', data, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        });
        return response;
      } catch (error) {
        if (error.response && error.response.status === 429) {
          retryCount++;
          const retryAfter = error.response.headers['retry-after'] || 1;
          console.log(`Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
          await delay(retryAfter * 1000);
        } else {
          throw error;
        }
      }
    }

    throw new Error('Max retries exceeded');
  };

  const analyzeImage = async (file) => {
    try {
      // Utiliser Tesseract.js pour extraire le texte de l'image
      const { data: { text } } = await Tesseract.recognize(file, 'eng');
      const prompt = `Describe the product in this image based on the following text: ${text.trim()}`;
      
      const response = await makeOpenAIRequest({
        model: "gpt-3.5-turbo",
        messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      });

      const resultText = response.data.choices[0].message.content.trim();
      return resultText;
    } catch (error) {
      console.error('Error:', error);
      return 'Unknown nature';
    }
  };

  const extractValue = (text, key) => {
    const regex = new RegExp(`${key}:\\s*(.*)`, 'i');
    const match = text.match(regex);
    return match ? match[1] : null;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Extract Product Information from Image or PDF</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-lg shadow-md">
        <input 
          type="file" 
          accept="image/*,application/pdf" 
          onChange={handleFileChange} 
          className="mb-4 w-full p-2 border rounded"
        />
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-700 transition-colors"
        >
          Extract and Process Text
        </button>
      </form>
      {loading && <p className="mt-4">Loading...</p>}
      {jsonData && (
        <div className="w-full max-w-md bg-white p-6 mt-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Extracted Product Information:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(jsonData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;

