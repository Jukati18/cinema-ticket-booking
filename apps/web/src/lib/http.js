export class ApiError extends Error {
  constructor(code, message, fieldErrors = {}) { super(message); this.code = code; this.fieldErrors = fieldErrors; }
}
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export async function request(path, { signal, ...options } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options, signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) throw new ApiError(body?.error?.code || 'HTTP_ERROR', body?.error?.message || 'Không thể xử lý yêu cầu', body?.error?.fieldErrors);
    if (!body || !('data' in body)) throw new ApiError('INVALID_RESPONSE', 'Dữ liệu máy chủ chưa đúng hợp đồng đề xuất');
    return body.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('NETWORK_ERROR', 'Không kết nối được máy chủ. Vui lòng thử lại');
  } finally { clearTimeout(timeout); }
}
