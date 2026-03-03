import axiosInstance from './axiosInstance';

export const signupUser = async (signupData) => {
  const response = await axiosInstance.post('/users/signup', signupData);
  return response.data;
};

export const signinUser = async (signinData) => {
  const response = await axiosInstance.post('/users/signin', signinData);
  return response.data;
};

export const getProfileData = async () => {
  const response = await axiosInstance.get('/users/profile-data');
  const payload = response.data;
  const mappedUser =
    payload?.data?.user ||
    payload?.data?.profile ||
    payload?.user ||
    payload?.profile ||
    payload?.data ||
    null;

  return {
    ...payload,
    data: mappedUser
      ? {
          ...(payload?.data && typeof payload.data === 'object' ? payload.data : {}),
          user: mappedUser,
        }
      : payload?.data,
  };
};

export const changePassword = async (passwords) => {
  const response = await axiosInstance.patch('/users/change-password', passwords);
  return response.data;
};

export const uploadProfilePhoto = async (file) => {
  const formData = new FormData();
  formData.append('photo', file);
  const response = await axiosInstance.put('/users/upload-photo', formData);
  return response.data;
};

export const getSuggestions = async ({ page = 1, limit = 10 } = {}) => {
  const response = await axiosInstance.get('/users/suggestions', {
    params: { page, limit },
  });
  return response.data;
};

export const getUserProfileById = async (userId) => {
  const response = await axiosInstance.get(`/users/${userId}/profile`);
  const payload = response.data;
  const mappedUser =
    payload?.data?.user ||
    payload?.data?.profile ||
    payload?.user ||
    payload?.profile ||
    payload?.data ||
    null;

  return {
    ...payload,
    data: mappedUser
      ? {
          ...(payload?.data && typeof payload.data === 'object' ? payload.data : {}),
          user: mappedUser,
        }
      : payload?.data,
  };
};

export const getUserPostsById = async (userId, { page = 1, limit = 20 } = {}) => {
  const response = await axiosInstance.get(`/users/${userId}/posts`, {
    params: { page, limit },
  });

  const payload = response.data;
  const posts =
    payload?.data?.posts ||
    payload?.posts ||
    payload?.data ||
    [];

  return {
    ...payload,
    data: {
      ...(payload?.data && typeof payload.data === 'object' ? payload.data : {}),
      posts: Array.isArray(posts) ? posts : [],
    },
    meta: payload?.meta || {},
  };
};
