import api from "../lib/axios";

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
}

export const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};
