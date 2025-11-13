export interface Author {
  id: number;
  name: string;
  details?: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  name: string;
  content: string;
  author: Author; // readOnly nested author
  author_id?: number; // writeOnly when creating/updating
  created_at: string;
  updated_at: string;
}

export interface CreateBookPayload {
  name: string;
  content: string;
  author_id: number;
}

export interface UpdateBookPayload {
  name?: string;
  content?: string;
  author_id?: number;
}

export interface CreateAuthorPayload {
  name: string;
  details?: string;
}

export interface UpdateAuthorPayload {
  name?: string;
  details?: string;
}

