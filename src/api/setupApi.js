import api from "./axios"; 

export const searchSetups = ({ search, page, size, type }) => {
  return api.get("/api/setups/search", {
    params: { search, page, size, type },
  });
};

export const getAllTrees = () => {
  return api.get("/api/setups/tree/all");
};


export const getByType = (type) => {
  return api.get(`/api/setups/${type}`);
};  

export const createSetup = (payload) => {
  return api.post("/api/setups", payload);
};

export const createSetupWithParent = (parentName, payload) => {
  return api.post(`/api/setups/create/${parentName}`, payload);
};

export const toggleSetup = (uuid, enabled) => {
  return api.patch(`/api/setups/${uuid}/toggle`, { enabled });
};

export const enableSetup = (uuid) => {
  return api.patch(`/api/setups/${uuid}/enable`, { enabled: true });
};

export const disableSetup = (uuid) => {
  return api.patch(`/api/setups/${uuid}/disable`, { enabled: false });
};

export  default {
  searchSetups,
  getAllTrees,
  createSetup,
  toggleSetup,
  enableSetup,
  disableSetup,
  getByType,
  createSetupWithParent
};

