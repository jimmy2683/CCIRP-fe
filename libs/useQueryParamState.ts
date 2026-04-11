"use client";

import { startTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface UseQueryParamStateOptions {
    defaultValue?: string;
}

export function useQueryParamState(
    key: string,
    options: UseQueryParamStateOptions = {},
) {
    const { defaultValue = "" } = options;
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlValue = searchParams.get(key) ?? defaultValue;

    const updateValue = (nextValue: string) => {
        const nextParams = new URLSearchParams(searchParams.toString());
        if (nextValue.trim()) {
            nextParams.set(key, nextValue);
        } else {
            nextParams.delete(key);
        }

        const nextQuery = nextParams.toString();
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

        startTransition(() => {
            router.replace(nextUrl, { scroll: false });
        });
    };

    return {
        value: urlValue,
        setValue: updateValue,
    };
}
