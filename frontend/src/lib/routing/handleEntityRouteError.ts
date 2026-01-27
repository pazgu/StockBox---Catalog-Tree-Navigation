import type { NavigateFunction } from "react-router-dom";

type FetchStatusError = Error & { status?: number };

export function handleEntityRouteError(
  err: unknown,
  navigate: NavigateFunction,
): boolean {
  const axiosStatus = (err as any)?.response?.status as number | undefined;

  const fetchStatus = (err as FetchStatusError)?.status;

  const status = axiosStatus ?? fetchStatus;

  if (status === 403) {
    navigate("/403", { replace: true });
    return true;
  }

  if (status === 404) {
    navigate("/404", { replace: true });
    return true;
  }

  return false;
}
