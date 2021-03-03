export interface IProBoard {
  id: string;
  boardId: string;
  pendingListId: string;
  activeListId: string;
  doneListId: string;
  name: string;
  shortName: string;
  icon: string;
  order: number;
}

export const emptyProBoard: IProBoard = {
  id: null,
  boardId: null,
  pendingListId: null,
  activeListId: null,
  doneListId: null,
  name: null,
  shortName: null,
  icon: null,
  order: null
}