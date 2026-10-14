import { clearToken, getToken } from "../utils/auth";

// endpoints that must be callable without a token
const PUBLIC_PATHS = ["/login", "/sign-in"];

type Method = "GET" | "POST" | "PUT" | "DELETE";

// error replies from FastAPI: a string, or a list of validation errors for bad input (422)
interface ErrorBody {
    detail?: string | { msg: string }[];
    message?: string;
}

// attaches the bearer token from the cookie to every non-public request
const withAuth = (url: string, headers: Record<string, string> = {}) => {
    const token = getToken();
    const isPublic = PUBLIC_PATHS.includes(new URL(url).pathname);

    if (!token || isPublic) return headers;
    return { Authorization: `Bearer ${token}`, ...headers };
};

// a 401 on a protected endpoint means the token is missing, expired or invalid:
// drop it and send the user back to login
const handleUnauthorized = (url: string, response: Response) => {
    if (response.status !== 401 || PUBLIC_PATHS.includes(new URL(url).pathname)) return;
    clearToken();
    window.location.assign("/login");
};

const errorMessage = (body: ErrorBody) => {
    if (Array.isArray(body.detail)) return body.detail[0]?.msg ?? "Invalid input";
    return body.detail || body.message || "Something went wrong";
};

// downloads a protected file: fetches it with the token, then saves it via a temporary link
// (a plain <a href> can't send the Authorization header)
export const downloadFile = async (url: string, fileName: string) => {
    const response = await fetch(url, { headers: withAuth(url) });

    handleUnauthorized(url, response);

    if (!response.ok) {
        const result: ErrorBody = await response.json().catch(() => ({}));
        throw new Error(errorMessage(result) || "Download failed");
    }

    const blobUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};

// sends a request and returns the parsed JSON reply, typed by the caller: fetchHandler<{ data: ... }>(...)
// (a plain async function, not a React hook, so it can be called from event handlers and callbacks)
export const fetchHandler = async <T = unknown>(
    requestPayload: unknown,
    method: Method,
    url: string,
    headers: Record<string, string> = {}
): Promise<T> => {
    // form bodies are sent as-is (the browser sets their content-type), everything else as JSON
    const isFormBody =
        requestPayload instanceof URLSearchParams || requestPayload instanceof FormData;
    const hasBody = method !== "GET" && requestPayload !== null && requestPayload !== undefined;

    const response = await fetch(url, {
        method,
        headers: hasBody && !isFormBody
            ? withAuth(url, { "Content-Type": "application/json", ...headers })
            : withAuth(url, headers),
        body: !hasBody ? undefined : isFormBody ? requestPayload : JSON.stringify(requestPayload),
    });

    handleUnauthorized(url, response);

    const result = await response.json();
    if (!response.ok) {
        throw new Error(errorMessage(result as ErrorBody));
    }

    return result as T;
};
