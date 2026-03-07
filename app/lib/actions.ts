'use server';

import { z } from 'zod';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

const FormSchema = z.object({
  id: z.string(),
  name: z.string().min(3, { message: 'Product name must be at least 3 characters.' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters.' }),
  price: z.coerce.number().gt(0, { message: 'Please enter a price greater than 0.' }),
  status: z.enum(['active', 'inactive'], {
    invalid_type_error: 'Please select a product status.',
  }),
  image_url: z.string().optional(),
});

const CreateProduct = FormSchema.omit({ id: true });
const UpdateProduct = FormSchema.omit({ id: true });

export type State = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createProduct(prevState: State | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized. Please log in.' };
  }

  const validatedFields = CreateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    status: formData.get('status'),
    image_url: formData.get('image_url') || '',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Product.',
    };
  }

  const { name, description, price, status, image_url } = validatedFields.data;

  try {
    await sql`
      INSERT INTO products (vendor_id, name, description, price, status, image_url)
      VALUES (${session.user.id}, ${name}, ${description}, ${price}, ${status}, ${image_url || null})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Create Product.' };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function updateProduct(
  id: string,
  prevState: State | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { message: 'Unauthorized. Please log in.' };
  }

  const validatedFields = UpdateProduct.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    status: formData.get('status'),
    image_url: formData.get('image_url') || '',
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Product.',
    };
  }

  const { name, description, price, status, image_url } = validatedFields.data;

  try {
    await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${price}, status = ${status}, image_url = ${image_url || null}
      WHERE id = ${id} AND vendor_id = ${session.user.id}
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Update Product.' };
  }

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}

export async function deleteProduct(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized.');
  }

  try {
    await sql`DELETE FROM products WHERE id = ${id} AND vendor_id = ${session.user.id}`;
    revalidatePath('/dashboard/products');
  } catch (error) {
    console.error('Database Error:', error);
  }
}
