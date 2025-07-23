import { UseMutationResult } from "@tanstack/react-query";
import { LoginResponse } from "../types";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../services/api";

export const useLogin = (
    onSuccess: (data: LoginResponse) => void,
    onError?: (error: Error) => void,
): UseMutationResult<LoginResponse, Error, { email: string, password: string }, unknown> => {
  return useMutation({
    mutationFn: ({ email, password }) => apiClient.login(email, password),
    onSuccess,
    ...(onError && { onError })
  });
};



