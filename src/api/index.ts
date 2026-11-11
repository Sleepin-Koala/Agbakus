const SERVER = "http://127.0.0.1:9888";

// Classe d'erreur personnalisée avec typage du statut
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Interfaces pour le typage des requêtes
interface RequestOptions {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

interface RequestParams {
  params?: Record<string, any>;
  body?: any;
}

// Fonction générique de requête
async function request<T = any>(
  method: string,
  path: string,
  { params, body }: RequestParams = {}
): Promise<T> {
  // Construction de l'URL avec les paramètres de requête optionnels
  let url = SERVER + path;

  if (params && Object.keys(params).length > 0) {
    // Filtrage des valeurs undefined / null
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== undefined)
    );
    
    const qs = new URLSearchParams(filteredParams);
    url += '?' + qs.toString();
  }

  const options: RequestOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (e: any) {
    // Erreur réseau (backend hors ligne, échec CORS preflight, etc.)
    throw new ApiError(
      `Cannot reach the server. Is the backend running on port 3000? (${e.message})`,
      500
    );
  }

  // Analyse du JSON — même les réponses d'erreur d'Express sont en JSON
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new ApiError(`Server returned non-JSON response (status ${res.status})`, res.status);
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `HTTP ${res.status}`, res.status);
  }

  return data as T;
}

// Export de l'objet API typé
const api = {
  get: <T = any>(path: string, params?: Record<string, any>) => 
    request<T>('GET', path, { params }),
    
  post: <T = any>(path: string, body?: any) => 
    request<T>('POST', path, { body }),
    
  patch: <T = any>(path: string, body?: any) => 
    request<T>('PATCH', path, { body }),
    
  delete: <T = any>(path: string) => 
    request<T>('DELETE', path),
};

export default api;
