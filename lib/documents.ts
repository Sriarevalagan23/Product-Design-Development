import { supabase } from './supabase';

import * as FileSystem from 'expo-file-system/legacy';

// Utility to convert base64 to Uint8Array for Supabase Storage
const decodeBase64 = (base64: string) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  let bufferLength = base64.length * 0.75;
  if (base64[base64.length - 1] === '=') bufferLength--;
  if (base64[base64.length - 2] === '=') bufferLength--;

  const bytes = new Uint8Array(bufferLength);
  let p = 0;
  for (let i = 0; i < base64.length; i += 4) {
    const encoded1 = lookup[base64.charCodeAt(i)];
    const encoded2 = lookup[base64.charCodeAt(i + 1)];
    const encoded3 = lookup[base64.charCodeAt(i + 2)];
    const encoded4 = lookup[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }
  return bytes;
};

export interface UserDocument {
  id: string;
  user_id: string;
  report_category: string;
  report_name: string;
  hospital_name?: string;
  report_date?: string;
  additional_notes?: string;
  file_url: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;

  created_at: string;
}


/**
 * Saves a new document record in the database.
 */
export async function saveUserDocument(document: Omit<UserDocument, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('user_documents')
    .insert([document])
    .select()
    .single();

  if (error) {
    console.error('Error saving document:', error);
    throw error;
  }

  return data as UserDocument;
}

/**
 * Fetches all documents for a specific user.
 */
export async function getUserDocuments(userId: string) {
  const { data, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }

  return data as UserDocument[];
}

/**
 * Deletes a document by its ID.
 */
export async function deleteUserDocument(documentId: string) {
  const { error } = await supabase
    .from('user_documents')
    .delete()
    .eq('id', documentId);

  if (error) {
    console.error('Error deleting document:', error);
    throw error;
  }

  return true;
}

/**
 * Uploads a document file to the 'user_docs' Supabase storage bucket.
 * Returns the public URL and the storage path of the uploaded file.
 */
export async function uploadDocumentFile(
  userId: string,
  fileUri: string,
  fileName: string,
  fileType: string = 'application/octet-stream',
  preGeneratedFilePath?: string
) {
  try {
    const timestamp = new Date().getTime();
    const safeName = fileName || 'document';
    const cleanFileName = safeName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const filePath = preGeneratedFilePath || `${userId}/${timestamp}_${cleanFileName}`;

    // Convert local file URI to bytes for a stable RN upload payload.
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const fileBytes = decodeBase64(base64);

    let lastError: any = null;
    let data: any = null;

    // Retry once for transient network issues.
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await supabase.storage
        .from('user_docs')
        .upload(filePath, fileBytes, {
          contentType: fileType,
          upsert: true,
        });

      data = result.data;
      lastError = result.error;
      if (!lastError) {
        break;
      }
    }

    if (lastError) {
      console.error('Storage upload error:', lastError);
      throw lastError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user_docs')
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  } catch (err) {
    console.error('Error in uploadDocumentFile:', err);
    throw err;
  }
}
