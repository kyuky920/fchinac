import { describe, expect, it } from "vitest";
import {
  LECTURE_NOTES_BOARD_KEY,
  isDownloadBoard,
  isResourceBoard,
} from "../../lib/board-presentation";

describe("강의록 게시판 표시 정책", () => {
  it("TC-LECTURE-NOTES-001 강의록을 파일 다운로드형 독립 게시판으로 표시한다", () => {
    expect(LECTURE_NOTES_BOARD_KEY).toBe("lecture_notes");
    expect(isDownloadBoard(LECTURE_NOTES_BOARD_KEY)).toBe(true);
    expect(isResourceBoard(LECTURE_NOTES_BOARD_KEY)).toBe(false);
  });

  it("TC-LECTURE-NOTES-002 기존 서적 게시판의 다운로드형 표시를 유지한다", () => {
    expect(isDownloadBoard("book_old")).toBe(true);
    expect(isResourceBoard("book_old")).toBe(true);
  });
});
