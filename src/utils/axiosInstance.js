import axios from "axios";

const apiClient = () => {
  const token = localStorage.getItem("authToken");
  const headers = {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };

  const instance = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}`,
    responseType: "json",
    headers,
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        return Promise.reject(error.response.data.message);
      }
      return Promise.reject(error.response.data.message);
    }
  );

  return instance;
};

export default apiClient;
