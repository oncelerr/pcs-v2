// Bootstrap file: configures Axios as the global HTTP client for API requests
import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
