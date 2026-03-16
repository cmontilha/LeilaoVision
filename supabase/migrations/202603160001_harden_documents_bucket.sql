-- Harden documents bucket for private access and safer uploads.

update storage.buckets
set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
where id = 'documents';
