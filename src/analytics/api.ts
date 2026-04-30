import { Ga4RunReportHttpRequest, Ga4RunReportHttpResponse } from "./types";

export type Ga4ClientOptions = {
  baseUrl?: string;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

export async function runGa4Report(
  body: Ga4RunReportHttpRequest,
  opts: Ga4ClientOptions = {},
): Promise<Ga4RunReportHttpResponse> {
  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };
  const url = `/api/proxy?path=Analytics/report`;
  // console.log("Request URL => ", url.toString());

  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    console.error(`Error fetching data analytics data: ${res.statusText}`);
    throw new Error(
      errorData.message || `Error fetching analytics data: ${res.statusText}`,
    );
  }

  return (await res.json()) as Ga4RunReportHttpResponse;
}
