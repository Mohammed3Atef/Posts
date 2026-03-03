import axiosInstance from './axiosInstance';

export const getNotifications = async ({ page = 1, limit = 20 } = {}) => {
  const response = await axiosInstance.get('/notifications', {
    params: { page, limit },
  });
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
