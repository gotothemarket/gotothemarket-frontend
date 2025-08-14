export function createQueryOptions({
  queryKey,
  queryFn,
  staleTime,
  gcTime,
  enabled,
  select,
  placeholderData,
}) {
  return {
    queryKey,
    queryFn,
    staleTime: staleTime ?? 60_000,
    gcTime: gcTime ?? 5 * 60_000,
    enabled,
    select,
    placeholderData,
  };
}

export function createMutationOptions({
  mutationFn,
  invalidateKeys = [],
  onSuccess,
  onError,
  onSettled,
}) {
  return {
    mutationFn,
    onSuccess: async (data, variables, ctx) => {
      if (invalidateKeys.length) {
        const { queryClient } = await import('./queryClient');
        await Promise.all(
          invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })),
        );
      }
      if (onSuccess) await onSuccess(data, variables, ctx);
    },
    onError,
    onSettled,
  };
}
