import { auth } from '@/auth';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const vendorId = session.user.id;
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'File must be 2 MB or smaller' }, { status: 400 });
  }

  const mime = file.type;
  const ext = MIME_TO_EXT[mime];
  if (!ext) {
    return Response.json(
      { error: 'Use PNG, JPG, WebP, GIF, or SVG' },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const baseDir = join(process.cwd(), 'public', 'uploads', 'logos');
  await mkdir(baseDir, { recursive: true });

  for (const ext of ['png', 'jpg', 'webp', 'gif', 'svg']) {
    try {
      await unlink(join(baseDir, `${vendorId}.${ext}`));
    } catch {
      // ignore missing
    }
  }

  const filename = `${vendorId}.${ext}`;
  const dest = join(baseDir, filename);
  await writeFile(dest, buffer);

  const publicPath = `/uploads/logos/${filename}`;
  return Response.json({ url: publicPath });
}
