import { UseMutationResult } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../services/api";

export const useLogout = (
    onSuccess: () => void,
    onError?: (error: Error) => void,
): UseMutationResult<void, Error, { session: string }, unknown> => {
  return useMutation({
    mutationFn: ({ session }) => apiClient.logout(session),
    onSuccess,
    ...(onError && { onError })
  });
};
