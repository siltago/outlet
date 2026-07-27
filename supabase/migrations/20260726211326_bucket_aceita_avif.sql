-- Libera AVIF no bucket de fotos de produto (o app já validava só
-- PNG/JPEG/WEBP; sem isso o Storage rejeitaria o upload mesmo passando pela
-- validação da Server Action).
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/avif']
where id = 'produto-fotos';
