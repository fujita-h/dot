import { SignInForm } from '@/components/auth/sign-in-form';
import { Error404, Error500 } from '@/components/error';
import { StackList } from '@/components/notes/stack-list';
import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import {
  getStockedLabelsWithCount,
  getStockedNotesCount,
  getStockedNotesWithUserGroupTopicsByLabelId,
} from '@/libs/prisma/stock';
import { LabelsList } from './form';

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (status === 401) return <SignInForm />;
  if (status === 500) return <Error500 />;
  if (status === 404 || !userId) return <Error404 />;

  const { category } = searchParams;

  const [labels, total] = await Promise.all([
    getStockedLabelsWithCount(userId).catch((e) => []),
    getStockedNotesCount(userId).catch((e) => 0),
  ]);

  const notes = await getStockedNotesWithUserGroupTopicsByLabelId(userId, category?.toString()).catch((e) => []);

  return (
    <div className="flex gap-6">
      <div className="w-72">
        <LabelsList category={category?.toString()} labels={labels} total={total} />
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-md p-2">
          <StackList notes={notes} />
        </div>
      </div>
    </div>
  );
}
