'server-only';

import prisma from '@/libs/prisma/instance';
import { GroupType } from '@prisma/client';

export function getNoteWithUserGroupTopics(noteId: string, authorizedRequestUserId: string) {
  return prisma.note
    .findUnique({
      where: {
        id: noteId,
        OR: [
          { Group: null },
          { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
          { Group: { type: GroupType.BLOG } },
          { Group: { type: GroupType.COMMUNITY } },
        ],
      },
      include: {
        User: true,
        Group: { include: { Members: true } },
        Topics: { include: { Topic: true }, orderBy: { order: 'asc' } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching note');
    });
}

// if you change this function, you should change getNotesCount too
export function getNotesWithUserGroupTopics(authorizedRequestUserId: string, take?: number, skip?: number) {
  return prisma.note
    .findMany({
      where: {
        userId: authorizedRequestUserId,
        OR: [
          { Group: null },
          { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
          { Group: { type: GroupType.BLOG } },
          { Group: { type: GroupType.COMMUNITY } },
        ],
      },
      orderBy: { releasedAt: 'desc' },
      take,
      skip,
      include: {
        User: true,
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

// if you change this function, you should change getNotesWithUserGroupTopics too
export function getNotesCount(authorizedRequestUserId: string) {
  return prisma.note
    .count({
      where: {
        userId: authorizedRequestUserId,
        OR: [
          { Group: null },
          { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
          { Group: { type: GroupType.BLOG } },
          { Group: { type: GroupType.COMMUNITY } },
        ],
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

// if you change this function, you should change getCommentedNotesCount too
export function getCommentedNotesWithUserGroupTopics(authorizedRequestUserId: string, take?: number, skip?: number) {
  return prisma.note
    .findMany({
      where: {
        Comments: { some: { userId: authorizedRequestUserId } },
        OR: [
          { Group: null },
          { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
          { Group: { type: GroupType.BLOG } },
          { Group: { type: GroupType.COMMUNITY } },
        ],
      },
      orderBy: { releasedAt: 'desc' }, // ToDo: Sort by user's latest comment date. (maybe required to get data from prisma.comment)
      take,
      skip,
      include: {
        User: true,
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

// if you change this function, you should change getCommentedNotesWithUserGroupTopics too
export function getCommentedNotesCount(authorizedRequestUserId: string) {
  return prisma.note
    .count({
      where: {
        Comments: { some: { userId: authorizedRequestUserId } },
        OR: [
          { Group: null },
          { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
          { Group: { type: GroupType.BLOG } },
          { Group: { type: GroupType.COMMUNITY } },
        ],
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

// if you change this function, you should change getNotesCountByGroupId too
export function getNotesWithUserGroupTopicsByGroupId(
  groupId: string,
  authorizedRequestUserId: string,
  take?: number,
  skip?: number
) {
  return prisma.note
    .findMany({
      where: {
        Group: { id: groupId },
        OR: [
          { Group: null },
          { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
          { Group: { type: GroupType.BLOG } },
          { Group: { type: GroupType.COMMUNITY } },
        ],
      },
      orderBy: { releasedAt: 'desc' },
      take,
      skip,
      include: {
        User: true,
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

export function getNotesWithUserGroupTopicsByTopicId(
  topicId: string,
  authorizedRequestUserId: string,
  take?: number,
  skip?: number
) {
  return prisma.note
    .findMany({
      where: {
        Topics: { some: { topicId } },
        OR: [
          { Group: null },
          { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
          { Group: { type: GroupType.BLOG } },
          { Group: { type: GroupType.COMMUNITY } },
        ],
      },
      orderBy: { releasedAt: 'desc' },
      take,
      skip,
      include: {
        User: true,
        Group: true,
        Topics: { include: { Topic: true } },
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

// if you change this function, you should change getNotesWithUserGroupTopicsByGroupId too
export function getNotesCountByGroupId(groupId: string, authorizedRequestUserId: string) {
  return prisma.note
    .count({
      where: {
        Group: { id: groupId },
        OR: [
          { Group: null },
          { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
          { Group: { type: GroupType.BLOG } },
          { Group: { type: GroupType.COMMUNITY } },
        ],
      },
    })
    .catch((e) => {
      console.error(e);
      throw new Error('Error occurred while fetching notes');
    });
}

// if you change this function, you should change getTimelineNotesCount too
export function getTimelineNotesWithUserGroupTopics(authorizedRequestUserId: string, take?: number, skip?: number) {
  return prisma.note.findMany({
    where: {
      AND: [
        {
          OR: [
            { Group: null },
            { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
            { Group: { type: GroupType.BLOG } },
            { Group: { type: GroupType.COMMUNITY } },
          ],
        },
        {
          OR: [
            { User: { FollowingUsers: { some: { fromUserId: authorizedRequestUserId } } } },
            { Group: { FollowedUsers: { some: { userId: authorizedRequestUserId } } } },
            { Topics: { some: { Topic: { FollowedUsers: { some: { userId: authorizedRequestUserId } } } } } },
          ],
        },
      ],
    },
    orderBy: { releasedAt: 'desc' },
    include: {
      User: true,
      Group: true,
      Topics: { include: { Topic: true } },
    },
    take,
    skip,
  });
}

// if you change this function, you should change getTimelineNotesWithUserGroupTopics too
export function getTimelineNotesCount(authorizedRequestUserId: string) {
  return prisma.note.count({
    where: {
      AND: [
        {
          OR: [
            { Group: null },
            { Group: { type: GroupType.PRIVATE, Members: { some: { userId: authorizedRequestUserId } } } },
            { Group: { type: GroupType.BLOG } },
            { Group: { type: GroupType.COMMUNITY } },
          ],
        },
        {
          OR: [
            { User: { FollowingUsers: { some: { fromUserId: authorizedRequestUserId } } } },
            { Group: { FollowedUsers: { some: { userId: authorizedRequestUserId } } } },
            { Topics: { some: { Topic: { FollowedUsers: { some: { userId: authorizedRequestUserId } } } } } },
          ],
        },
      ],
    },
  });
}
