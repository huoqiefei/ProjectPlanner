
// Configure your WordPress backend URL here
// For local development, it might be 'http://localhost/wordpress'
// For production, 'https://your-site.com'
export const WP_API_URL = 'https://planner.cn'; 

export const API_ENDPOINTS = {
    LOGIN: `${WP_API_URL}/wp-json/jwt-auth/v1/token`,
    REGISTER: `${WP_API_URL}/wp-json/planner/v1/register`,
    RESET_PASSWORD: `${WP_API_URL}/wp-json/planner/v1/reset-password`,
    ME: `${WP_API_URL}/wp-json/wp/v2/users/me`
};
