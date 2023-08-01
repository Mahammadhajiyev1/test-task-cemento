const express = require("express");
const router = express.Router();
const cache = require("../helper/lruHelper");
const axios = require("axios");

const TTLMap = {
  Buildings: 10,
  Checklists: 60 * 5,
  Members: 60 * 60 * 24,
  Config: 60 * 60 * 6,
};

async function makeApiRequest(topic, id) {
  const endpointMap = {
    Buildings: `/v1/structure?projectId=${id}&locationType=building`,
    Checklists: `/v2/Checklists?projectId=${id}`,
    Members: `/v1/project/${id}?fields=["members"]`,
    Config: `/v1/configurations?projectId=${id}`,
  };

  const endpoint = endpointMap[topic];
  if (!endpoint) {
    throw new Error("Invalid topic");
  }

  try {
    const response = await axios.get(`https://api.cemento.ai${endpoint}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch data from the API");
  }
}


router.get("/:topic/:id", async (req, res) => {
  const { topic, id } = req.params;
  const key = `${topic}:${id}`;
  const ttl = TTLMap[topic] * 1000 || 60 * 1000;

  // Check if data is in cache
  const cachedData = cache.get(key);
  if (cachedData) {
    console.log(cache);
    console.log("Data retrieved from the cache");
    return res.json(cachedData);
  }

  // Create a new promise for this key to handle concurrent requests
  const requestPromise = makeApiRequest(topic, id)
    .then((data) => {
      cache.set(key, data, { ttl: ttl });
      console.log("Data retrieved from the API and cached");
      return data;
    })
    .catch((error) => {
      throw error;
    });

  try {
    const data = await requestPromise;
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch data from the API" });
  }
});

module.exports = router;
