"use client";

import { useActionState } from "react";
import { createPostAction, type CreatePostState } from "@/app/[locale]/admin/actions";
import type { WritableBoard } from "@/lib/admin";

const initialState: CreatePostState = {};

export function PostForm({ locale, boards }: { locale: string; boards: WritableBoard[] }) {
  const [state, formAction, pending] = useActionState(
    createPostAction.bind(null, locale),
    initialState,
  );
  return (
    <form action={formAction}>
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      <div className="field">
        <label htmlFor="boardKey">게시판</label>
        <select id="boardKey" name="boardKey" required>
          {boards.map((board) => <option key={board.key} value={board.key}>{board.name}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="title">제목</label>
        <input id="title" maxLength={500} name="title" required />
      </div>
      <div className="field">
        <label htmlFor="body">본문</label>
        <textarea id="body" name="body" required />
      </div>
      <button className="button" disabled={pending || boards.length === 0} type="submit">
        {pending ? "저장 중…" : "게시물 저장"}
      </button>
    </form>
  );
}

