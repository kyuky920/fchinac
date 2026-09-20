export const LECTURE_NOTES_BOARD_KEY = "lecture_notes";

const resourceBoardKeys = new Set([
  "book_old",
  "book_faith2",
  "book_faith",
  "book_data",
  "korean_reference",
]);

export function isResourceBoard(boardKey: string): boolean {
  return resourceBoardKeys.has(boardKey);
}

export function isDownloadBoard(boardKey: string): boolean {
  return boardKey === LECTURE_NOTES_BOARD_KEY || isResourceBoard(boardKey);
}
