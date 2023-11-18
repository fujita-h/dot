import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import { getGroupFromHandle, getGroupFromHandleWithMembers } from '@/libs/prisma/group';
import clsx from 'clsx';
import { Metadata } from 'next';
import Link from 'next/link';

type Props = {
  params: { handle: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await auth();
  const { status, userId: sessionUserId } = await getUserIdFromSession(session);
  if (status === 401) return { title: `Sign In - ${SITE_NAME}` };
  if (status === 500) return { title: `Server Error - ${SITE_NAME}` };
  if (status === 404 || !sessionUserId) return { title: `Not Found - ${SITE_NAME}` };

  const group = await getGroupFromHandle(params.handle).catch((e) => null);
  if (!group) return { title: `Not Found - ${SITE_NAME}` };
  return { title: `${group.name} - ${SITE_NAME}` };
}

export default async function Page({ params }: Props) {
  const session = await auth();
  const { status, userId: sessionUserId } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !sessionUserId) return <Error404 />;

  const group = await getGroupFromHandleWithMembers(params.handle).catch((e) => null);
  if (!group) return <Error404 />;

  if (group.type === 'PRIVATE' && !group.Members.find((member) => member.userId === sessionUserId)) {
    return (
      <div className="space-y-4">
        <Header group={group} />
        <div className="md:flex md:gap-1">
          <div className="mt-4 flex-1 items-center">
            <div>あなたにはこのグループを参照する権限がありません</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Header group={group} />
      <div className="md:flex md:gap-1">
        <div className="md:w-80 p-2">
          <div>
            <div className="text-base font-semibold text-gray-800 font-noto-sans-jp">メンバー</div>
            <div className="mt-2 ml-3 flex">
              {group.Members.map((member) => (
                <div key={member.userId} className="flex items-center">
                  <Link href={`/users/${member.User.handle}`}>
                    <img
                      src={`/api/users/${member.userId}/icon`}
                      className="w-8 h-8 rounded-full object-cover"
                      alt="user-icon"
                    />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:flex-1">
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-md p-2">
              <div className="text-base font-semibold text-gray-800 font-noto-sans-jp">固定されたノート</div>
            </div>
            <div className="bg-white rounded-md p-2">
              <div className="text-base font-semibold text-gray-800 font-noto-sans-jp">ノート</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Header({ group }: { group: { id: string; name: string } }) {
  return (
    <div className="bg-white rounded-md">
      <div className={clsx('bg-white relative w-full', 'h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] xl:h-[160px]')}>
        <img
          src={`/api/groups/${group.id}/image`}
          className="absolute top-0 w-full h-full object-cover"
          alt="group image"
        />
        <div
          className={clsx(
            'absolute bg-white rounded-md p-1 lg:p-2',
            'top-[60%] sm:top-[50%] left-[5%]',
            'w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] xl:w-[160px]',
            'h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] xl:h-[160px]'
          )}
        >
          <img src={`/api/groups/${group.id}/icon`} className="w-full h-full rounded-md" alt="group-icon" />
        </div>
      </div>
      <div
        className={clsx(
          'mt-1 lg:mt-2',
          'ml-[calc(5%_+_80px_+_8px)] sm:ml-[calc(5%_+_100px_+_8px)] md:ml-[calc(5%_+_120px_+_10px)] lg:ml-[calc(5%_+_140px_+_12px)] xl:ml-[calc(5%_+_160px_+_12px)]',
          'min-h-[60px] md:min-h-[70px] lg:min-h-[80px] xl:min-h-[90px]'
        )}
      >
        <div className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold truncate">{group.name}</div>
      </div>
    </div>
  );
}
