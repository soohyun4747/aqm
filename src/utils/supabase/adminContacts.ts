import { supabaseClient } from '@/lib/supabase/client';
import { sanitizeEmailList, sanitizePhoneList } from '@/src/utils/contact';

export interface AdminContactInfo {
        emails: string[];
        phones: string[];
}

export async function fetchAdminContactByUserId(userId: string): Promise<AdminContactInfo> {
        const supabase = supabaseClient();

        const { data, error } = await supabase
                .from('admin_contacts')
                .select('emails, phones')
                .eq('user_id', userId)
                .maybeSingle();

        if (error) throw error;

        const emails = Array.isArray(data?.emails) ? sanitizeEmailList(data?.emails as string[]) : [];
        const phones = Array.isArray(data?.phones) ? sanitizePhoneList(data?.phones as string[]) : [];

        return { emails, phones };
}

export async function upsertAdminContact(
        userId: string,
        emails: string[],
        phones: string[]
): Promise<AdminContactInfo> {
        const supabase = supabaseClient();

        const sanitizedEmails = sanitizeEmailList(emails);
        const sanitizedPhones = sanitizePhoneList(phones);

        const { error } = await supabase
                .from('admin_contacts')
                .upsert(
                        {
                                user_id: userId,
                                emails: sanitizedEmails.length ? sanitizedEmails : null,
                                phones: sanitizedPhones.length ? sanitizedPhones : null,
                        },
                        { onConflict: 'user_id' }
                );

        if (error) throw error;

        return {
                emails: sanitizedEmails,
                phones: sanitizedPhones,
        };
}
