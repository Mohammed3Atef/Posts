import { useState } from "react";
import {
  createReply,
  getCommentReplies,
  toggleCommentLike,
} from "../api/postsApi";
import { useToast } from "../context/ToastContext";
import { getErrorMessage, getUserId } from "../utils/errorMessage";

function CommentItem({
  comment,
  postId,
  currentUserId,
  onDelete,
  onUpdate,
  onLike,
  onPostRefresh,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(comment?.content || comment?.body || "");
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replies, setReplies] = useState([]);
  const [newReply, setNewReply] = useState("");
  const [addingReply, setAddingReply] = useState(false);
  const { showToast } = useToast();

  const commentId = comment?._id || comment?.id;
  const commentOwnerId = getUserId(
    comment?.commentCreator || comment?.user || comment?.author,
  );
  const canManage =
    currentUserId && commentOwnerId && currentUserId === commentOwnerId;
  const replyCount = comment?.repliesCount || comment?.replies?.length || 0;
  const createdLabel = comment?.createdAt
    ? new Date(comment.createdAt).toLocaleString()
    : "";

  const loadReplies = async () => {
    if (!postId || !commentId) return;
    setRepliesLoading(true);
    try {
      const result = await getCommentReplies(postId, commentId, {
        page: 1,
        limit: 20,
      });
      const list =
        result?.data?.replies || result?.replies || result?.data || [];
      setReplies(Array.isArray(list) ? list : []);
    } catch (error) {
      showToast("error", getErrorMessage(error));
    } finally {
      setRepliesLoading(false);
    }
  };

  const toggleRepliesPanel = async () => {
    if (repliesOpen) {
      setRepliesOpen(false);
      return;
    }
    setRepliesOpen(true);
    await loadReplies();
  };

  const saveEdit = () => {
    if (!body.trim()) {
      showToast("error", "Comment text is required.");
      return;
    }

    onUpdate(commentId, body.trim(), () => setIsEditing(false));
  };

  const addReply = async (event) => {
    event.preventDefault();
    const text = newReply.trim();
    if (!text) {
      showToast("error", "Reply text is required.");
      return;
    }

    setAddingReply(true);
    try {
      await createReply(postId, commentId, { content: text });
      setNewReply("");
      await loadReplies();
      showToast("success", "Reply added.");
      await onPostRefresh?.();
    } catch (error) {
      showToast("error", getErrorMessage(error));
    } finally {
      setAddingReply(false);
    }
  };

  const handleReplyLike = async (replyId) => {
    try {
      await toggleCommentLike(postId, replyId);
      await loadReplies();
      showToast("success", "Reply like updated.");
      await onPostRefresh?.();
    } catch (error) {
      showToast("error", getErrorMessage(error));
    }
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-200">
          {comment?.commentCreator?.name || comment?.user?.name || "User"}
        </p>
        <p className="text-[11px] text-slate-400">{createdLabel}</p>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="min-h-20 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Update your comment..."
          />
          <div className="flex gap-2">
            <button
              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
              onClick={saveEdit}
            >
              Save
            </button>
            <button
              className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-2 whitespace-pre-wrap text-sm text-slate-100">
          {comment?.content || comment?.body || "No text"}
        </p>
      )}

      {canManage && !isEditing ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
          <button
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
            onClick={() => onDelete(commentId)}
          >
            Delete
          </button>
          <button
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
            onClick={() => onLike(commentId)}
          >
            Like ({comment?.likesCount || comment?.likes?.length || 0})
          </button>
          <button
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
            onClick={toggleRepliesPanel}
          >
            {repliesOpen ? "Hide replies" : `Replies (${replyCount})`}
          </button>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
            onClick={() => onLike(commentId)}
          >
            Like ({comment?.likesCount || comment?.likes?.length || 0})
          </button>
          <button
            className="rounded-lg border border-slate-600 bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-600"
            onClick={toggleRepliesPanel}
          >
            {repliesOpen ? "Hide replies" : `Replies (${replyCount})`}
          </button>
        </div>
      )}

      {repliesOpen ? (
        <div className="mt-3 border-l border-slate-600 pl-3 sm:pl-4">
          <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-300">
            Replies
          </h5>
          <form className="mt-2 space-y-2" onSubmit={addReply}>
            <textarea
              className="min-h-16 w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white outline-none transition focus:border-blue-500"
              value={newReply}
              onChange={(event) => setNewReply(event.target.value)}
              placeholder="Write a reply..."
            />
            <div className="flex justify-end">
              <button
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                disabled={addingReply}
              >
                {addingReply ? "Adding..." : "Add Reply"}
              </button>
            </div>
          </form>

          <div className="mt-3 space-y-2">
            {repliesLoading ? (
              <p className="text-xs text-slate-400">Loading replies...</p>
            ) : null}
            {!repliesLoading && replies.length === 0 ? (
              <p className="text-xs text-slate-400">No replies yet.</p>
            ) : null}
            {replies.map((reply) => {
              const replyCreatedLabel = reply?.createdAt
                ? new Date(reply.createdAt).toLocaleString()
                : "";
              return (
                <article
                  key={reply?._id || reply?.id}
                  className="rounded-lg border border-slate-700 bg-slate-700 p-2.5"
                >
                  <p className="text-xs font-medium text-slate-200">
                    {reply?.commentCreator?.name ||
                      reply?.replyCreator?.name ||
                      reply?.user?.name ||
                      "User"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-100">
                    {reply?.content || reply?.body || "No text"}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {replyCreatedLabel}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      className="rounded-lg border border-slate-600 bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-200 transition hover:bg-slate-700"
                      onClick={() => handleReplyLike(reply?._id || reply?.id)}
                    >
                      Like ({reply?.likesCount || reply?.likes?.length || 0})
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default CommentItem;
