import type { ReactNode } from "react";
import { t } from "@lingui/core/macro";
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { useForm } from "react-hook-form";
import {
  HiEllipsisHorizontal,
  HiOutlinePlus,
  HiOutlineSquaresPlus,
  HiOutlineTrash,
} from "react-icons/hi2";

import { authClient } from "@kan/auth/client";

import Dropdown from "~/components/Dropdown";
import { Tooltip } from "~/components/Tooltip";
import { usePermissions } from "~/hooks/usePermissions";
import { useModal } from "~/providers/modal";
import { api } from "~/utils/api";
import { InlineCardComposer } from "./InlineComposers";

interface ListProps {
  children: ReactNode;
  index: number;
  list: List;
  cardCount?: number;
  setSelectedPublicListId: (publicListId: PublicListId) => void;
}

interface List {
  publicId: string;
  name: string;
  createdBy?: string | null;
}

interface FormValues {
  listPublicId: string;
  name: string;
}

type PublicListId = string;

export default function List({
  children,
  index,
  list,
  cardCount,
  setSelectedPublicListId,
}: ListProps) {
  const { openModal } = useModal();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const { canCreateCard, canEditList, canDeleteList } = usePermissions();
  const { data: session } = authClient.useSession();
  const isCreator = list.createdBy && session?.user.id === list.createdBy;
  const canEdit = canEditList || isCreator;
  const canDrag = canEditList || isCreator;

  const openNewCardForm = (publicListId: PublicListId) => {
    if (!canCreateCard) return;
    openModal("NEW_CARD");
    setSelectedPublicListId(publicListId);
  };

  const updateList = api.list.update.useMutation();

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      listPublicId: list.publicId,
      name: list.name,
    },
    values: {
      listPublicId: list.publicId,
      name: list.name,
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!canEdit) return;
    updateList.mutate({
      listPublicId: values.listPublicId,
      name: values.name,
    });
  };

  const handleOpenDeleteListConfirmation = () => {
    setSelectedPublicListId(list.publicId);
    openModal("DELETE_LIST");
  };

  const dropdownItems = [
    ...(canCreateCard
      ? [
          {
            label: t`Add a card`,
            action: () => openNewCardForm(list.publicId),
            icon: (
              <HiOutlineSquaresPlus className="h-[18px] w-[18px] text-dark-900" />
            ),
          },
        ]
      : []),
    ...(canDeleteList || isCreator
      ? [
          {
            label: t`Delete list`,
            action: handleOpenDeleteListConfirmation,
            icon: <HiOutlineTrash className="h-[18px] w-[18px] text-dark-900" />,
          },
        ]
      : []),
  ];

  return (
    <Draggable
      key={list.publicId}
      draggableId={list.publicId}
      index={index}
      isDragDisabled={!canDrag}
    >
      {(provided) => (
        <div
          key={list.publicId}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mr-2 flex h-fit max-h-full w-[272px] min-w-[272px] max-w-[272px] flex-col rounded-xl bg-trello-list p-2 text-[#172B4D] shadow-sm dark:bg-trello-list-dark dark:text-dark-1000"
        >
          <div className="mb-1 flex items-center gap-1">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="min-w-0 flex-1 focus-visible:outline-none"
            >
              <input
                id="name"
                type="text"
                {...register("name")}
                onBlur={handleSubmit(onSubmit)}
                readOnly={!canEdit}
                className="w-full rounded border-0 bg-transparent px-2 py-1 text-sm font-semibold text-[#172B4D] focus:ring-2 focus:ring-trello-label-blue focus-visible:outline-none dark:text-dark-1000"
              />
            </form>
            {typeof cardCount === "number" && (
              <span className="px-1 text-xs font-medium tabular-nums text-[#626F86] dark:text-dark-900">
                {cardCount}
              </span>
            )}
            {dropdownItems.length > 0 && (
              <div className="relative ml-1 inline-block">
                <Dropdown items={dropdownItems}>
                  <span className="flex h-7 w-7 items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10">
                    <HiEllipsisHorizontal className="h-5 w-5 text-[#44546F] dark:text-dark-900" />
                  </span>
                </Dropdown>
              </div>
            )}
          </div>

          {children}

          {canCreateCard &&
            (isAddingCard ? (
              <InlineCardComposer
                listPublicId={list.publicId}
                onClose={() => setIsAddingCard(false)}
              />
            ) : (
              <div className="mt-1 flex items-center gap-1">
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="flex flex-1 items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#44546F] hover:bg-black/10 dark:text-dark-900 dark:hover:bg-white/10"
                >
                  <HiOutlinePlus className="h-4 w-4" aria-hidden="true" />
                  {t`Add a card`}
                </button>
                <Tooltip content={t`Add a card (detailed)`}>
                  <button
                    onClick={() => openNewCardForm(list.publicId)}
                    className="rounded-lg p-2 text-[#44546F] hover:bg-black/10 dark:text-dark-900 dark:hover:bg-white/10"
                    aria-label={t`Add a card (detailed)`}
                  >
                    <HiOutlineSquaresPlus className="h-[18px] w-[18px]" />
                  </button>
                </Tooltip>
              </div>
            ))}
        </div>
      )}
    </Draggable>
  );
}
