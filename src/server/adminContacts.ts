import { supabaseAdmin } from '@/lib/supabase/admin';
import { sanitizeEmailList, sanitizePhoneList } from '@/src/utils/contact';

export interface AdminNotificationContacts {
        emails: string[];
        phones: string[];
}

export async function fetchAdminNotificationContacts(): Promise<AdminNotificationContacts> {
        const supabase = supabaseAdmin();

        const { data, error } = await supabase
                .from('admin_contacts')
                .select('emails, phones');

        if (error) {
                throw error;
        }

        const emailSet = new Set<string>();
        const phoneSet = new Set<string>();

        for (const row of data ?? []) {
                if (Array.isArray(row.emails)) {
                        for (const email of sanitizeEmailList(row.emails as string[])) {
                                emailSet.add(email);
                        }
                }
                if (Array.isArray(row.phones)) {
                        for (const phone of sanitizePhoneList(row.phones as string[])) {
                                phoneSet.add(phone);
                        }
                }
        }

        return {
                emails: Array.from(emailSet),
                phones: Array.from(phoneSet),
        };
}
