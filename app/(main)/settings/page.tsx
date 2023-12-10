import { RedirectType, redirect } from 'next/navigation';
export default async function Redirect() {
  redirect('settings/general', RedirectType.replace);
}
