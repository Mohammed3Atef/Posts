import axiosInstance from './axiosInstance';

export const getNotifications = async ({ unread, page = 1, limit = 20 } = {}) => {
  const params = { page, limit };
  if (typeof unread === 'boolean') {
    params.unread = unread;
  }
  const response = await axiosInstance.get('/notifications', { params });
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axiosInstance.get('/notifications/unread-count');
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await axiosInstance.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await axiosInstance.patch('/notifications/read-all');
  return response.data;
};
