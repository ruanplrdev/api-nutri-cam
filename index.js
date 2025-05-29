require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const API_KEY = process.env.USDA_API_KEY;

app.get('/alimento/:nome', async (req, res) => {
  const nome = req.params.nome;

  try {
    const searchRes = await axios.get('https://api.nal.usda.gov/fdc/v1/foods/search', {
      params: {
        query: nome,
        pageSize: 1,
        api_key: API_KEY
      }
    });

    const food = searchRes.data.foods[0];
    if (!food) return res.status(404).json({ error: 'Alimento não encontrado' });

    const nutrients = {};
    for (const nutrient of food.foodNutrients) {
      const name = nutrient.nutrientName.toLowerCase();
      if (name.includes("protein")) nutrients.proteinas = nutrient.value;
      if (name.includes("carbohydrate")) nutrients.carboidratos = nutrient.value;
      if (name.includes("fat")) nutrients.gorduras = nutrient.value;
      if (name.includes("energy")) nutrients.calorias = nutrient.value;
    }

    res.json({
      alimento: food.description,
      ...nutrients
    });

  } catch (err) {
    res.status(500).json({ error: 'Erro ao consultar a API USDA', detalhes: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
