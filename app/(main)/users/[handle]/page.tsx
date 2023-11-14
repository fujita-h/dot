import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { StackList } from '@/components/notes/stack-list';
import { SimpleTab } from '@/components/tabs/simple-tab';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { SITE_NAME } from '@/libs/constants';
import { getNotesWithUserGroupTopics } from '@/libs/prisma/note';
import { getUserFromHandle } from '@/libs/prisma/user';
import { Metadata } from 'next';
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

  const user = await getUserFromHandle(params.handle).catch((e) => null);
  if (!user) return { title: `Not Found - ${SITE_NAME}` };
  return { title: `${user.name} - ${SITE_NAME}` };
}

export default async function Page({ params }: Props) {
  const session = await auth();
  const { status, userId: sessionUserId } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !sessionUserId) return <Error404 />;

  const user = await getUserFromHandle(params.handle).catch((e) => null);
  if (!user) return <Error404 />;

  const notes = await getNotesWithUserGroupTopics(user.id);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md">
        <div className="bg-white relative w-full h-[80px] lg:h-[160px]">
          <img
            src={`/api/users/${user.id}/image`}
            className="absolute top-0 w-full h-full object-cover"
            alt="user image"
          />
          <div className="absolute top-[50%] left-[5%] w-[80px] h-[80px] lg:w-[160px] lg:h-[160px] bg-white rounded-full">
            <img src={'/api/user/icon'} className="w-full h-full p-2 rounded-full" alt="user-icon" />
          </div>
        </div>
        <div className="mt-1 lg:mt-3 ml-[calc(5%_+_80px)] lg:ml-[calc(5%_+_160px)] min-h-[60px] lg:min-h-[80px]">
          <div className="text-xl lg:text-3xl font-bold truncate">{user.name}</div>
          <div className="text-sm lg:text-base text-gray-500 truncate">@{user.handle}</div>
        </div>
      </div>
      <div className="md:flex md:gap-1">
        <div className="md:w-80 p-2">
          <div>
            <div className="text-base font-semibold text-gray-800 font-noto-sans-jp">所属グループ</div>
          </div>
          <div>
            <div className="text-base font-semibold text-gray-800 font-noto-sans-jp">フォロー中のグループ</div>
          </div>
          <div>
            <div className="text-base font-semibold text-gray-800 font-noto-sans-jp">フォロー中のトピック</div>
          </div>
        </div>
        <div className="md:flex-1 bg-white rounded-md p-2">
          <div>
            <div className="text-base font-semibold text-gray-800 font-noto-sans-jp">固定された記事</div>
          </div>
          <div className="my-3">
            <SimpleTab
              tabs={[
                { name: '投稿した記事', href: '#', current: true },
                { name: 'コメントした記事', href: './comments', current: false },
              ]}
            />
          </div>
          <div>
            <StackList notes={notes} />
          </div>
        </div>
      </div>
    </div>
  );
}
