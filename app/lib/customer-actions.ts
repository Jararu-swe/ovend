'use server';

import { sql } from './db';
import bcrypt from 'bcryptjs';

export async function createCustomerAccount(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const whatsapp_number = formData.get('whatsapp_number') as string;

  if (!name || !email || !password) {
    return { error: 'Missing required fields.' };
  }

  try {
    const [existingUser] = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
    if (existingUser) {
      return { error: 'An account with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await sql`
      INSERT INTO users (name, email, password, whatsapp_number, role)
      VALUES (${name}, ${email}, ${hashedPassword}, ${whatsapp_number || null}, 'customer')
      RETURNING id
    `;

    // Link any past orders with matching phone number
    if (whatsapp_number && newUser?.id) {
      await linkPastOrdersByPhone(newUser.id, whatsapp_number);
    }

    return { success: true };
  } catch (err) {
    console.error('Error creating customer:', err);
    return { error: 'Failed to create customer account.' };
  }
}

export async function updateCustomerSettings(formData: FormData, userId: string) {
  const name = formData.get('name') as string;
  const whatsapp_number = formData.get('whatsapp_number') as string;
  const delivery_address = formData.get('delivery_address') as string;
  const delivery_latitude = formData.get('delivery_latitude') ? parseFloat(formData.get('delivery_latitude') as string) : null;
  const delivery_longitude = formData.get('delivery_longitude') ? parseFloat(formData.get('delivery_longitude') as string) : null;
  const delivery_address_details = formData.get('delivery_address_details') as string;

  try {
    await sql`
      UPDATE users 
      SET 
        name = ${name},
        whatsapp_number = ${whatsapp_number || null},
        delivery_address = ${delivery_address || null},
        delivery_latitude = ${delivery_latitude},
        delivery_longitude = ${delivery_longitude},
        delivery_address_details = ${delivery_address_details || null}
      WHERE id = ${userId} AND role = 'customer'
    `;
    return { success: true };
  } catch (err) {
    console.error('Error updating customer settings:', err);
    return { error: 'Failed to update settings.' };
  }
}

export async function linkPastOrdersByPhone(userId: string, phoneNumber: string) {
  if (!phoneNumber) return;
  
  try {
    // Link all past orders with matching phone number to this customer account
    await sql`
      UPDATE orders
      SET customer_account_id = ${userId}
      WHERE customer_phone = ${phoneNumber}
        AND customer_account_id IS NULL
    `;
  } catch (err) {
    console.error('Error linking past orders:', err);
  }
}
