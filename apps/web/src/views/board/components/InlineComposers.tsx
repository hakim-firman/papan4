import { t } from "@lingui/core/macro";
import { useEffect, useRef, useState } from "react";
import { HiXMark } from "react-icons/hi2";

import { usePopup } from "~/providers/popup";
import { api } from "~/utils/api";

/**
 * Trello-style inline card composer. Replaces the "Add a card" footer button.
 * Enter submits and keeps the composer open for the next card; Esc / blur (when
 * empty) closes it.
 */
export function InlineCardComposer({
  listPublicId,
  onClose,
}: {
  listPublicId: string;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const createCard = api.card.create.useMutation({
    onError: () =>
      showPopup({
        header: t`Unable to create card`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      }),
    onSettled: async () => {
      await utils.board.byId.invalidate();
    },
  });

  const submit = () => {
    const value = title.trim();
    if (!value) return;
    createCard.mutate({
      title: value,
      description: "",
      listPublicId,
      labelPublicIds: [],
      memberPublicIds: [],
      position: "end",
      dueDate: null,
    });
    setTitle("");
    textareaRef.current?.focus();
  };

  return (
    <div className="mt-1">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        onBlur={() => {
          if (!title.trim()) onClose();
        }}
        rows={2}
        placeholder={t`Enter a title or paste a link`}
        className="w-full resize-none rounded-lg bg-trello-card px-3 py-2 text-sm text-[#172B4D] shadow-[0_1px_1px_rgba(9,30,66,0.25)] placeholder-[#626F86] focus:outline-none dark:bg-trello-card-dark dark:text-dark-1000 dark:placeholder-dark-800"
      />
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={submit}
          className="rounded bg-trello-label-blue px-3 py-1.5 text-sm font-medium text-[#1D2125] transition-colors hover:bg-[#85B8FF]"
        >
          {t`Add card`}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1.5 text-[#44546F] hover:bg-black/10 dark:text-dark-900 dark:hover:bg-white/10"
          aria-label={t`Cancel`}
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/**
 * Trello-style inline list composer. Replaces the "Add another list" button.
 */
export function InlineListComposer({
  boardPublicId,
  onClose,
}: {
  boardPublicId: string;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { showPopup } = usePopup();
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const createList = api.list.create.useMutation({
    onError: () =>
      showPopup({
        header: t`Unable to create list`,
        message: t`Please try again later, or contact customer support.`,
        icon: "error",
      }),
    onSettled: async () => {
      await utils.board.byId.invalidate();
    },
  });

  const submit = () => {
    const value = name.trim();
    if (!value) return;
    createList.mutate({ name: value, boardPublicId });
    setName("");
    inputRef.current?.focus();
  };

  return (
    <div className="mr-2 h-fit w-[272px] min-w-[272px] max-w-[272px] rounded-xl bg-trello-list p-2 shadow-sm dark:bg-trello-list-dark">
      <input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        onBlur={() => {
          if (!name.trim()) onClose();
        }}
        placeholder={t`Enter list name…`}
        className="w-full rounded border-0 bg-white px-2 py-1.5 text-sm text-[#172B4D] shadow-sm ring-2 ring-trello-label-blue focus:outline-none dark:bg-dark-300 dark:text-dark-1000"
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={submit}
          className="rounded bg-trello-label-blue px-3 py-1.5 text-sm font-medium text-[#1D2125] transition-colors hover:bg-[#85B8FF]"
        >
          {t`Add list`}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1.5 text-[#44546F] hover:bg-black/10 dark:text-dark-900 dark:hover:bg-white/10"
          aria-label={t`Cancel`}
        >
          <HiXMark className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
