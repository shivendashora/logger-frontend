import { clearToken, getToken } from "../utils/auth";

// endpoints that must be callable without a token
const PUBLIC_PATHS = ["/login", "/sign-in"];

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

const postRequest = async (
    url: string,
    requestPayload: any,
    ...args: any[]
) => {
    // form bodies are sent as-is (the browser sets their content-type), everything else as JSON
    const isFormBody =
        requestPayload instanceof URLSearchParams || requestPayload instanceof FormData;

    const data = await fetch(url, {
        method: "POST",
        headers: isFormBody
            ? withAuth(url, args[0])
            : withAuth(url, { "Content-Type": "application/json", ...args[0] }),
        body: isFormBody ? requestPayload : JSON.stringify(requestPayload)
    });

    handleUnauthorized(url, data);

    const result = await data.json();
    if (!data.ok) {
        throw new Error(
            result.detail || result.message || "Something went wrong"
        );
    }

    return result
};

const getRequest = async (
    url: string,
    ...args: any[]
) => {
    const data = await fetch(url, {
        method: "GET",
        headers: withAuth(url, args[0])
    });

    handleUnauthorized(url, data);

    const result = await data.json();
    if (!data.ok) {
        throw new Error(
            result.detail || result.message || "Something went wrong"
        );
    }

    return result
};

// downloads a protected file: fetches it with the token, then saves it via a temporary link
// (a plain <a href> can't send the Authorization header)
export const downloadFile = async (url: string, fileName: string) => {
    const response = await fetch(url, { headers: withAuth(url) });

    handleUnauthorized(url, response);

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.detail || "Download failed");
    }

    const blobUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
};

export const useFetchHandler = async (
    requestPayload: any,
    method: string,
    url: string,
    ...args: any[]
) => {
    switch (method) {
        case "POST": {
            const response = await postRequest(
                url,
                requestPayload,
                ...args
            );
            return response;
        }

        case "GET": {
            const response = await getRequest(url, ...args);
            return response;
        }

        default:
            throw new Error(`Unsupported HTTP method: ${method}`);
    }
};
