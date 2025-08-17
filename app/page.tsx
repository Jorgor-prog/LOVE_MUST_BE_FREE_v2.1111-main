// app/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Root() {
  // если понадобится проверять сессию по cookie — можно читать здесь cookies()
  redirect('/login');
}
