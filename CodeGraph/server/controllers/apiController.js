const graphService = require('../services/graphService');

const listApis = async (req, res, next) => {
  try {
    const data = await graphService.getApis();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const searchApis = async (req, res, next) => {
  try {
    const query = req.query.q || req.query.query || '';
    const data = await graphService.searchApis(query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getApiMetadata = async (req, res, next) => {
  try {
    const { name } = req.params;
    const data = await graphService.getApiDetails(name);
    if (!data) {
      return res.status(404).json({ error: `API with name "${name}" not found.` });
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getApiDependencies = async (req, res, next) => {
  try {
    const { name } = req.params;
    const data = await graphService.getApiDependencies(name);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getApiImpact = async (req, res, next) => {
  try {
    const { name } = req.params;
    const data = await graphService.getApiImpact(name);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getAllNodes = async (req, res, next) => {
  try {
    const data = await graphService.getAllNodes();
    res.json(data.nodes);
  } catch (error) {
    next(error);
  }
};

const getShortestPath = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end nodes are required parameters.' });
    }
    const data = await graphService.getShortestPath(start, end);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listApis,
  searchApis,
  getApiMetadata,
  getApiDependencies,
  getApiImpact,
  getAllNodes,
  getShortestPath
};
