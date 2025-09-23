import { supabaseClient } from "@/lib/supabase/client";
import { inferMimeFromExt } from "../file";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** 스토리지에서 기존 파일 삭제 */
export async function removeFile(path: string, bucket: string) {
    const supabase = supabaseAdmin();
    await supabase.storage.from(bucket).remove([path]);
}


export async function downloadAsFile(path: string, bucket: string): Promise<File> {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);
    if (error) throw error;

    const name = path.split('/').pop() || 'download';
    // blob.type이 비어있는 경우 확장자로 추정
    const type = data.type || inferMimeFromExt(name) || undefined;
    return new File([data], name, { type, lastModified: Date.now() });
}

export async function uploadFileToPath(path: string, file: File, bucket: string) {
    const supabase = supabaseAdmin();
    // 이전 파일을 지웠다는 전제; upsert는 안전하게 false
    const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
        });
    if (error) throw error;
    return path;
}