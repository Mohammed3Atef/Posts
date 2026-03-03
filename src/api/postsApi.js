import axiosInstance from './axiosInstance';

const appendFileIfExists = (formData, key, file) => {
  if (file instanceof File) {
    formData.append(key, file);
  }
};

export const getPostsFeed = async ({ page = 1, limit = 10, only = '' } = {}) => {
  const params = { page, limit };
  const normalizedOnly = typeof only === 'string' ? only.trim() : '';
  if (normalizedOnly) {
    params.only = normalizedOnly;
  }

  const response = await axiosInstance.get('/posts/feed', {
    params,
  });
  return response.data;
};

export const getAllPosts = async () => {
  const response = await axiosInstance.get('/posts');
  return response.data;
};

export const getBookmarkedPosts = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const response = await axiosInstance.get('/posts/bookmarks', {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    // Fallback for deployments using feed filtering instead.
    const response = await axiosInstance.get('/posts/feed', {
      params: { page, limit, only: 'bookmarks' },
    });
    return response.data;
  }
};

export const getPostDetails = async (postId) => {
  const response = await axiosInstance.get(`/posts/${postId}`);
  return response.data;
};

export const createPost = async ({ body, image }) => {
  const formData = new FormData();
  formData.append('body', body);
  appendFileIfExists(formData, 'image', image);

  const response = await axiosInstance.post('/posts', formData);
  return response.data;
};

export const updatePost = async (postId, { body, image }) => {
  const formData = new FormData();
  formData.append('body', body);
  appendFileIfExists(formData, 'image', image);

  const response = await axiosInstance.put(`/posts/${postId}`, formData);
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await axiosInstance.delete(`/posts/${postId}`);
  return response.data;
};

export const getPostComments = async (postId, { page = 1, limit = 20 } = {}) => {
  const response = await axiosInstance.get(`/posts/${postId}/comments`, {
    params: { page, limit },
  });
  return response.data;
};

export const createComment = async (postId, { body, image }) => {
  const formData = new FormData();
  const text = body?.trim();
  if (text) {
    // Keep both keys for compatibility with different API payload parsers.
    formData.append('body', text);
    formData.append('content', text);
  }
  appendFileIfExists(formData, 'image', image);

  const response = await axiosInstance.post(`/posts/${postId}/comments`, formData);
  return response.data;
};

export const updateComment = async (postId, commentId, { body, image }) => {
  const formData = new FormData();
  const text = body?.trim();
  if (text) {
    formData.append('body', text);
    formData.append('content', text);
  }
  appendFileIfExists(formData, 'image', image);

  const response = await axiosInstance.put(`/posts/${postId}/comments/${commentId}`, formData);
  return response.data;
};

export const deleteComment = async (postId, commentId) => {
  const response = await axiosInstance.delete(`/posts/${postId}/comments/${commentId}`);
  return response.data;
};

export const togglePostLike = async (postId) => {
  const response = await axiosInstance.put(`/posts/${postId}/like`);
  return response.data;
};

export const getPostLikes = async (postId, { page = 1, limit = 20 } = {}) => {
  const response = await axiosInstance.get(`/posts/${postId}/likes`, {
    params: { page, limit },
  });
  return response.data;
};

export const toggleBookmark = async (postId) => {
  const response = await axiosInstance.put(`/posts/${postId}/bookmark`);
  return response.data;
};

export const sharePost = async (postId, body = '') => {
  const response = await axiosInstance.post(`/posts/${postId}/share`, { body });
  return response.data;
};

export const toggleCommentLike = async (postId, commentId) => {
  const response = await axiosInstance.put(`/posts/${postId}/comments/${commentId}/like`);
  return response.data;
};

export const getCommentReplies = async (postId, commentId, { page = 1, limit = 20 } = {}) => {
  const response = await axiosInstance.get(`/posts/${postId}/comments/${commentId}/replies`, {
    params: { page, limit },
  });
  return response.data;
};

export const createReply = async (postId, commentId, payload) => {
  const text = payload?.body || payload?.content || '';
  const response = await axiosInstance.post(`/posts/${postId}/comments/${commentId}/replies`, {
    body: text,
    content: text,
  });
  return response.data;
};
