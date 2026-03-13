const express = require('express');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const prompt = `You are a shopping comparison assistant.
From the product image, identify the most likely product and provide possible prices from popular websites.
Return STRICT JSON with this schema:
{
  "productName": "string",
  "confidence": 0-100,
  "priceComparisons": [
    {
      "website": "string",
      "price": "string",
      "currency": "string",
      "url": "string",
      "note": "string"
    }
  ],
  "analysisNotes": "string"
}
Rules:
- Include 5-10 likely websites.
- Prices should be realistic ranges/estimates when uncertain.
- If exact model is unclear, state assumptions in analysisNotes.
- Output JSON only.`;

app.post('/api/price-check', upload.single('productImage'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload an image file.' });
  }

  if (!client) {
    return res.status(500).json({
      error:
        'OPENAI_API_KEY is missing. Add it in your environment to use AI price comparison.'
    });
  }

  try {
    const base64Image = req.file.buffer.toString('base64');
    const imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this product image and compare possible prices.' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    });

    const raw = completion.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw);

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error:
        error?.message || 'Unable to analyze image right now. Please try again later.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`BestDeals AI running at http://localhost:${PORT}`);
});
