import { Calendar } from '@masknet/web3-providers'
import { useInfiniteQuery } from '@tanstack/react-query'
import { addDays, startOfMonth } from 'date-fns'

export function useNewsList(date: Date, enabled = true) {
    const startTime = startOfMonth(date).getTime()
    const endTime = addDays(startTime, 45).getTime()

    return useInfiniteQuery({
        enabled,
        queryKey: ['newsList', startTime, endTime],
        queryFn: async ({ pageParam }) => Calendar.getNewsList(startTime, endTime, pageParam),
        initialPageParam: undefined as any,
        getNextPageParam: (page) => page.nextIndicator,
        select(data) {
            return data.pages.flatMap((x) => x.data)
        },
    })
}
