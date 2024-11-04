import { SignInForm } from '@/components/auth';
import { StackList } from '@/components/notes/stack-list';
import { getSessionUser } from '@/libs/auth/utils';
import {
  getStockedLabelsWithCount,
  getStockedNotesCount,
  getStockedNotesWithUserGroupTopicsByLabelId,
} from '@/libs/prisma/stock';
import { LabelsList } from './form';

export default async function Page(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  const userId = user.id;

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
