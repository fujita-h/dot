import { SITE_NAME } from '@/libs/constants';
import { getSessionUser } from '@/libs/auth/utils';
import { SignInForm } from '@/components/auth';
import { getNotifications } from '@/libs/prisma/notification';
import { NotificationsList } from './form';

const LOCALE = process.env.LOCALE || 'ja-JP';
const TIMEZONE = process.env.TIMEZONE || 'Asia/Tokyo';

export async function generateMetadata() {
  return { title: `Notifications - ${SITE_NAME} ` };
}
export default async function Page() {
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  const userId = user.id;
  const notifications = await getNotifications(userId).catch(() => []);

  return (
    <div>
      <div className="md:flex md:gap-1">
        <div className="flex-none w-80 p-2 space-y-6">Left Panel</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-md p-2">
              {notifications.length === 0 && <div>通知はありません</div>}
              {notifications.length > 0 && (
                <NotificationsList notifications={notifications} LOCALE={LOCALE} TIMEZONE={TIMEZONE} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
