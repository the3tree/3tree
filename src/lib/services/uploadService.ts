// File Upload Utilities for Messages and Documents
import { supabase } from '@/lib/supabase';

export interface UploadResult {
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export function isAllowedFileType(file: File): boolean {
    return [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES, ...ALLOWED_AUDIO_TYPES].includes(file.type);
}

export function getFileCategory(mimeType: string): 'image' | 'document' | 'audio' | 'other' {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
    if (ALLOWED_DOC_TYPES.includes(mimeType)) return 'document';
    if (ALLOWED_AUDIO_TYPES.includes(mimeType)) return 'audio';
    return 'other';
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
    file: File,
    bucket: string,
    folder: string,
    onProgress?: (progress: UploadProgress) => void
): Promise<{ data: UploadResult | null; error: string | null }> {
    try {
        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return { data: null, error: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)}` };
        }

        // Validate file type
        if (!isAllowedFileType(file)) {
            return { data: null, error: 'File type not allowed. Please upload images, PDFs, or audio files.' };
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const extension = file.name.split('.').pop();
        const fileName = `${folder}/${timestamp}_${randomStr}.${extension}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            return { data: null, error: error.message };
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return {
            data: {
                url: publicUrlData.publicUrl,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            },
            error: null,
        };
    } catch (error: any) {
        console.error('Upload failed:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Upload message attachment
 */
export async function uploadMessageAttachment(
    file: File,
    conversationId: string
): Promise<{ data: UploadResult | null; error: string | null }> {
    return uploadFile(file, 'message-attachments', `conversations/${conversationId}`);
}

/**
 * Upload user avatar
 */
export async function uploadAvatar(
    file: File,
    userId: string
): Promise<{ data: UploadResult | null; error: string | null }> {
    // Avatars must be images
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return { data: null, error: 'Please upload an image file (JPEG, PNG, GIF, or WebP)' };
    }

    // Limit avatar size to 5MB
    if (file.size > 5 * 1024 * 1024) {
        return { data: null, error: 'Avatar must be less than 5MB' };
    }

    return uploadFile(file, 'avatars', `users/${userId}`);
}

/**
 * Upload therapist document
 */
export async function uploadTherapistDocument(
    file: File,
    therapistId: string,
    documentType: 'license' | 'qualification' | 'identity'
): Promise<{ data: UploadResult | null; error: string | null }> {
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
        return { data: null, error: 'Please upload a PDF or image file' };
    }

    return uploadFile(file, 'therapist-documents', `${therapistId}/${documentType}`);
}

/**
 * Delete a file from storage
 */
export async function deleteFile(
    bucket: string,
    path: string
): Promise<{ error: string | null }> {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);
        if (error) return { error: error.message };
        return { error: null };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Get signed URL for temporary access (useful for private files)
 */
export async function getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
): Promise<{ url: string | null; error: string | null }> {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) return { url: null, error: error.message };
        return { url: data.signedUrl, error: null };
    } catch (error: any) {
        return { url: null, error: error.message };
    }
}

export default {
    uploadFile,
    uploadMessageAttachment,
    uploadAvatar,
    uploadTherapistDocument,
    deleteFile,
    getSignedUrl,
    isAllowedFileType,
    getFileCategory,
    formatFileSize,
};
