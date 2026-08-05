const graphService = require('../services/graphService');

const getRecentApis = async (req, res, next) => {
  try {
    const recent = await graphService.getRecentApis();
    res.json(recent);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const statsData = await graphService.getStats();
    res.json(statsData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecentApis,
  getStats
};
