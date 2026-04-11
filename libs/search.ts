"use client";

export const REGEX_SEARCH_HINT = "Use plain text or /pattern/flags for regex";

export interface SearchPattern {
    query: string;
    isRegex: boolean;
    isValid: boolean;
    error?: string;
    regex?: RegExp;
}

export function parseSearchPattern(rawQuery: string): SearchPattern {
    const query = rawQuery.trim();
    if (!query) {
        return {
            query,
            isRegex: false,
            isValid: true,
        };
    }

    const regexMatch = query.match(/^\/(.+)\/([a-z]*)$/i);
    if (!regexMatch) {
        return {
            query,
            isRegex: false,
            isValid: true,
        };
    }

    try {
        return {
            query,
            isRegex: true,
            isValid: true,
            regex: new RegExp(regexMatch[1], regexMatch[2] || "i"),
        };
    } catch (error) {
        return {
            query,
            isRegex: true,
            isValid: false,
            error: error instanceof Error ? error.message : "Invalid regular expression",
        };
    }
}

export function matchesSearchPattern(pattern: SearchPattern, ...values: Array<string | null | undefined>): boolean {
    if (!pattern.query) {
        return true;
    }

    const haystacks = values
        .map((value) => String(value ?? "").trim())
        .filter(Boolean);

    if (haystacks.length === 0) {
        return false;
    }

    if (pattern.isRegex) {
        if (!pattern.regex) {
            return false;
        }
        return haystacks.some((value) => {
            pattern.regex!.lastIndex = 0;
            return pattern.regex!.test(value);
        });
    }

    const normalizedQuery = pattern.query.toLowerCase();
    return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function formatRecipientName(firstName?: string | null, lastName?: string | null, fallback?: string | null): string {
    const fullName = [firstName, lastName]
        .map((part) => String(part ?? "").trim())
        .filter(Boolean)
        .join(" ")
        .trim();

    return fullName || String(fallback ?? "").trim();
}
