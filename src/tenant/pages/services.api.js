import { api } from "../../shared/lib/apiClient"; export const ServicesAPI = { list: async()=> (await api.get("/services")).data, get: async(id)=> (await api.get(`/services/${id}`)).data };
