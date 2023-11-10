import { getLabels, getStockedLabels, getStockedUsersCount } from '@/libs/prisma/stock';
import { Form } from './form';

export async function StockButton({
  userId,
  noteId,
  showCounter = true,
  showRing = true,
  popoverDirection = 'right',
}: {
  userId: string;
  noteId: string;
  showCounter?: boolean;
  showRing?: boolean;
  popoverDirection?: 'left' | 'right';
}) {
  const [stockedLabels, labels, count] = await Promise.all([
    getStockedLabels(userId, noteId).catch((e) => []),
    getLabels(userId).catch((e) => []),
    getStockedUsersCount(noteId).catch((e) => 0),
  ]);

  return (
    <Form
      noteId={noteId}
      stockedLabels={stockedLabels}
      labels={labels}
      count={count}
      showCounter={showCounter}
      showRing={showRing}
      popoverDirection={popoverDirection}
    />
  );
}
