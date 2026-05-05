export type ProjectFile = {
  id: string;
  projectId: string;
  category: string;
  visibility: "INTERNAL" | "CLIENT_VISIBLE";
  title: string;
  secureUrl: string;
  originalFileName: string;
  bytes: number;
  mimeType: string;
  createdAt: string;
};

export type ProjectFilesResponse = {
  data: ProjectFile[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

