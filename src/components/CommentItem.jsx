import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { getUserId } from '../utils/errorMessage';

function CommentItem({ comment, postId, currentUserId, onDelete, onUpdate, onLike }) {
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(comment?.content || comment?.body || '');
  const { showToast } = useToast();

  const commentId = comment?._id || comment?.id;
  const commentOwnerId = getUserId(comment?.commentCreator || comment?.user || comment?.author);
  const canManage = currentUserId && commentOwnerId && currentUserId === commentOwnerId;

  const saveEdit = () => {
    if (!body.trim()) {
      showToast('error', 'Comment text is required.');
      return;
    }

    onUpdate(commentId, body.trim(), () => setIsEditing(false));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          {comment?.commentCreator?.name || comment?.user?.name || 'User'}
        </p>
        <p className="text-xs text-slate-500">{new Date(comment?.createdAt).toLocaleString()}</p>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="input min-h-20"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Update your comment..."
          />
          <div className="flex gap-2">
            <button className="btn-primary px-3 py-2 text-xs" onClick={saveEdit}>
              Save
            </button>
            <button className="btn-secondary px-3 py-2 text-xs" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-2 whitespace-pre-wrap text-sm text-slate-700">{comment?.content || comment?.body || 'No text'}</p>
      )}

      {canManage && !isEditing ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => setIsEditing(true)}>
            Edit
          </button>
          <button className="btn-danger px-3 py-1.5 text-xs" onClick={() => onDelete(commentId)}>
            Delete
          </button>
          <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => onLike(commentId)}>
            Like
          </button>
          <Link className="btn-secondary px-3 py-1.5 text-xs" to={`/posts/${postId}/comments/${commentId}/replies`}>
            Replies
          </Link>
        </div>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => onLike(commentId)}>
            Like
          </button>
          <Link className="btn-secondary px-3 py-1.5 text-xs" to={`/posts/${postId}/comments/${commentId}/replies`}>
            Replies
          </Link>
        </div>
      )}
    </div>
  );
}

export default CommentItem;
