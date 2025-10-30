import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import { AnalyticsSummaryResponse } from "@/types/api";

export const useAnalyticsSummary = () =>
  useQuery<AnalyticsSummaryResponse, Error>({
    queryKey: ["analytics", "summary"],
    queryFn: () => api.getAnalyticsSummary(),
    staleTime: 1000 * 60 // 1 minute
  });

export default useAnalyticsSummary;
