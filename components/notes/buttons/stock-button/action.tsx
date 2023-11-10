'use server';

import { auth } from '@/libs/auth';
import { getUserIdFromSession } from '@/libs/auth/utils';
import { DEFAULT_STOCK_LABEL_NAME } from '@/libs/constants';
import prisma from '@/libs/prisma/instance';
import { getLabels, getStockedLabels, getStockedUsersCount } from '@/libs/prisma/stock';

async function getReturnValues(userId: string, noteId: string) {
  return Promise.all([
    getStockedLabels(userId, noteId).catch((e) => []),
    getLabels(userId).catch((e) => []),
    getStockedUsersCount(noteId).catch((e) => 0),
  ]);
}

export async function stockDefault(noteId: string) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  // create default label if not exists
  const defaultLabel = await prisma.stockLabel.upsert({
    where: { userId_default: { userId, default: true } },
    update: {},
    create: {
      userId,
      name: DEFAULT_STOCK_LABEL_NAME,
      default: true,
    },
  });

  // add stock
  await prisma.stock.create({
    data: {
      userId,
      noteId,
      labelId: defaultLabel.id,
    },
  });

  const [stockedLabels, labels, count] = await Promise.all([
    getStockedLabels(userId, noteId).catch((e) => []),
    getLabels(userId).catch((e) => []),
    getStockedUsersCount(noteId).catch((e) => 0),
  ]);
  return { stockedLabels, labels, count };
}

export async function stock(noteId: string, labelId: string) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  // create stock if not exists
  await prisma.stock.upsert({
    where: { userId_noteId_labelId: { userId, noteId, labelId } },
    create: { userId, noteId, labelId },
    update: {},
  });

  const [stockedLabels, count] = await Promise.all([
    getStockedLabels(userId, noteId).catch((e) => []),
    getStockedUsersCount(noteId).catch((e) => 0),
  ]);
  return { stockedLabels, count };
}

export async function unStock(noteId: string, labelId: string) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  // delete stock if exists
  await prisma.stock.delete({ where: { userId_noteId_labelId: { userId, noteId, labelId } } });

  const [stockedLabels, count] = await Promise.all([
    getStockedLabels(userId, noteId).catch((e) => []),
    getStockedUsersCount(noteId).catch((e) => 0),
  ]);
  return { stockedLabels, count };
}

export async function createLabel(name: string) {
  const session = await auth();
  const { status, userId, error } = await getUserIdFromSession(session, true);
  if (!userId) throw new Error('Unauthorized');

  await prisma.stockLabel.create({ data: { userId, name } });
  const labels = await getLabels(userId).catch((e) => []);
  return { labels };
}
