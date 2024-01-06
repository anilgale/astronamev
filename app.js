const express = require('express');
const app = express();
const path = require('path');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const MODEL_NAME = "gemini-pro";
const API_KEY = "AIzaSyC-t5FAmRZQAWIApdWVohtkExPTBBH_q2c";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

router.post('/generate', async (req, res) => {
  const { birthDate, birthTime } = req.body;
  const genAI = new GoogleGenerativeAI();
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];

  const parts = [
    {text: "Doğum Tarihi ve Saati: bu kısımda yazılan tarihi ve saati kontrol ederek yıldız haritası çıkar.<div><br></div><div>Sonuç: Çıkartılan yıldız haritasını dünyanın en iyi yorumcusu gibi uzun olmayan cümlelerle, detaylı, en az 20 cümlelik, anlaşılır dilde yaz. Kişiye sen diye arkadaş canlısı bir dilde hitap et. Analizin sonuna maddeler halinde önerilerini yap.<br></div>"},
    {text: "Doğum Tarihi ve Saati: " + birthDate + " " + birthTime},
    {text: "Sonuç: "},
  ];

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig,
    safetySettings,
  });

  const response = result.response;
  const resultText = response.text();
  res.send(resultText);
});

app.use('/', router);

app.listen(3000);