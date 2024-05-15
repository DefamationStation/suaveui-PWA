import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { ChevronLeft, VideoIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import { SpinnerIcon } from "~/components/primitives/SpinnerIcon";
import { IsRouteTransitioning } from "~/internal/AnimatedOutlet";
import type { Reaction as TReaction } from "~/layouts/types";
import { type TextingProps } from "../../types";
import { Avatar } from "../components/Avatar";
import { ChatBubble } from "../components/ChatBubble";
import { ChatInput } from "../components/ChatInput";
import { ChaiColors } from "../types";

export const Texting = ({
  data,
  onMessageSend,
  loading: chatLoading,
  editingMessageId,
  onMessageDelete,
  onMessageSteer,
  onMessageRegenerate,
  onMessageReact,
  onMessageEditStart,
  onMessageEditDismiss,
  onMessageEditSubmit,
}: TextingProps) => {
  const isRouteTransitioning = useAtomValue(IsRouteTransitioning);

  const messages = useMemo(() => {
    return [...(data?.messages ?? [])].sort(
      (a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
  }, [data?.messages]);

  const persona = data?.chat?.personas?.[0];

  const shouldShowTail = useCallback(
    (i: number) => {
      if (messages[i - 1] && messages[i - 1]?.role !== messages[i]?.role) {
        return true;
      }
      return i === 0;
    },
    [messages],
  );

  return (
    <motion.main
      className="flex h-dvh w-dvw flex-col justify-between overflow-x-hidden bg-black text-white antialiased"
      exit={{ y: 15, opacity: 0 }}
    >
      {/* Activity Bar */}
      <section
        style={{ backgroundColor: ChaiColors.TEXTING_ACTIVITYBAR }}
        className="duration-[350ms] absolute left-0 top-0 z-10 flex h-20 w-full items-center justify-between px-5 text-white transition-all"
      >
        {/* Back */}
        <Link to="/">
          <motion.div style={{ color: ChaiColors.LINK }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ChevronLeft className="size-9" />
          </motion.div>
        </Link>

        {/* Contact Info */}
        <motion.div
          className="flex flex-col items-center justify-center gap-1 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Avatar src={persona?.avatar} displayName={persona?.name} />
          <p className="text-xs text-white">{persona?.name}</p>
        </motion.div>

        {/* Videocall */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <VideoIcon className="size-7" style={{ color: ChaiColors.LINK }} />
        </motion.div>
      </section>

      {/* Conversation */}
      {(isRouteTransitioning || chatLoading) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <SpinnerIcon className="size-6" variant="ios" />
        </div>
      )}

      <section
        className={twMerge(
          "flex h-1 flex-grow flex-col-reverse gap-2 overflow-x-clip overflow-y-scroll px-5 pb-2 pt-24",
        )}
      >
        {!isRouteTransitioning &&
          messages.map((message, i) => (
            <ChatBubble
              key={message.id}
              layoutId={message.id}
              from={message.role === "user" ? "me" : "them"}
              text={message.content}
              tail={shouldShowTail(i)}
              onDelete={() => onMessageDelete(message.id)}
              onSteer={() => onMessageSteer(message.id)}
              onRegenerate={() => onMessageRegenerate(message.id)}
              onReact={(reaction) => onMessageReact(message.id, reaction)}
              onEditStart={() => onMessageEditStart(message.id)}
              reactions={message.reactions as TReaction[] | null}
              isEditing={message.id === editingMessageId}
              onEditDismiss={() => onMessageEditDismiss(message.id)}
              onEditSubmit={(newContent) => onMessageEditSubmit(message.id, newContent)}
            />
          ))}
      </section>

      {/* Chat input */}
      <ChatInput onMessageSend={onMessageSend} />
    </motion.main>
  );
};
