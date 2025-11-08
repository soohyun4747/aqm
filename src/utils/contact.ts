export function sanitizeEmailList(emails: string[] = []): string[] {
        const seen = new Set<string>();
        const sanitized: string[] = [];

        for (const email of emails) {
                const normalized = (email ?? '').trim();
                if (!normalized) continue;

                const dedupeKey = normalized.toLowerCase();
                if (seen.has(dedupeKey)) continue;

                sanitized.push(normalized);
                seen.add(dedupeKey);
        }

        return sanitized;
}

export function sanitizePhoneList(phones: string[] = []): string[] {
        const seen = new Set<string>();
        const sanitized: string[] = [];

        for (const phone of phones) {
                const normalized = (phone ?? '').replace(/[^0-9+]/g, '');
                if (!normalized) continue;

                if (seen.has(normalized)) continue;

                sanitized.push(normalized);
                seen.add(normalized);
        }

        return sanitized;
}
