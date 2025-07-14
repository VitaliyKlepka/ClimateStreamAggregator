
export const getQueryClientDefaultOptions = () => ({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 30000, // 30 seconds
    },
  },
})
