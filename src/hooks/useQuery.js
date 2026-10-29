
import { useQuery } from "react-query";
import api from "../api/api";
import dayjs from "dayjs";

export const useFetchMyShortUrls = (token, onError) => {
    return useQuery(
        ["my-shortenurls", token],
        async () => {
            const response = await api.get("/api/urls/myurls", {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        },
        {
            enabled: Boolean(token),

            select: (data) => {
                if (!Array.isArray(data)) {
                    return [];
                }

                return [...data].sort(
                    (a, b) =>
                        new Date(b.createdDate) - new Date(a.createdDate)
                );
            },

            onError,
            staleTime: 5000,
        }
    );
};

export const useFetchTotalClicks = (token, onError, rangeDays = 30) => {
    const range = typeof rangeDays === "number"
        ? {
            startDate: dayjs()
                .subtract(rangeDays - 1, "day")
                .format("YYYY-MM-DD"),
            endDate: dayjs().format("YYYY-MM-DD"),
        }
        : rangeDays;
    const { startDate, endDate } = range;

    return useQuery(
        ["url-totalclick", token, startDate, endDate],
        async () => {
            const response = await api.get("/api/urls/totalClicks", {
                params: {
                    startDate,
                    endDate,
                },
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data;
        },
        {
            enabled: Boolean(token),

            select: (data) => {
                if (!data || typeof data !== "object" || Array.isArray(data)) {
                    return [];
                }

                return Object.entries(data)
                    .map(([clickDate, count]) => ({
                        clickDate,
                        count: Number(count),
                    }))
                    .filter(
                        (item) =>
                            Number.isFinite(item.count) &&
                            item.clickDate.slice(0, 10) >= startDate &&
                            item.clickDate.slice(0, 10) <= endDate
                    )
                    .sort((a, b) =>
                        a.clickDate.localeCompare(b.clickDate)
                    );
            },

            onError,
            staleTime: 5000,
        }
    );
};
