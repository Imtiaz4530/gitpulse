import api from "../lib/axios";

export interface Exam {
  _id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
  icon: string;
  isActive: boolean;
  isPopular: boolean;
  order: number;
}

export interface ExamPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetExamsResponse {
  success: boolean;
  exams: Exam[];
  pagination: ExamPagination;
}

export const getExams = async (
  page: number = 1,
  limit: number = 12,
  category?: string,
): Promise<GetExamsResponse> => {
  const response = await api.get("/exams", {
    params: {
      page,
      limit,
      ...(category ? { category } : {}),
    },
  });

  return response.data;
};
