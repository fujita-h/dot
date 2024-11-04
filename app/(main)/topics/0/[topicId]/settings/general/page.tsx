import { SignInForm } from '@/components/auth';
import { Error404 } from '@/components/error';
import { getSessionUser } from '@/libs/auth/utils';
import { getTopic } from '@/libs/prisma/topic';
import { Form } from './form';

const USER_ROLE_FOR_TOPIC_CREATION = process.env.USER_ROLE_FOR_TOPIC_CREATION || '';

type Props = {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page(props: Props) {
  const params = await props.params;
  const user = await getSessionUser();
  if (!user || !user.id) return <SignInForm />;
  const roles = user.roles || [];

  const topic = await getTopic(params.topicId).catch((e) => null);
  if (!topic) return <Error404 />;

  if (USER_ROLE_FOR_TOPIC_CREATION && !roles.includes(USER_ROLE_FOR_TOPIC_CREATION)) {
    return (
      <div className="space-y-4">
        <div className="md:flex md:gap-1">
          <div className="mt-4 flex-1 items-center">
            <div>あなたにはこのページを参照する権限がありません</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 divide-y divide-gray-900/10">
      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-4">
        <div className="px-4 sm:px-6">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Topic Settings</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">{topic.name}</p>
        </div>
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl md:col-span-3">
          <Form topic={topic} />
        </div>
      </div>
    </div>
  );
}
