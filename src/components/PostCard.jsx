import { Link } from 'react-router-dom';
import { getUserId } from '../utils/errorMessage';

function PostCard({ post, currentUserId, onDelete, onLike, onBookmark, onShare }) {
  const fallbackAvatar = 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';
  const postId = post?._id || post?.id;
  const postOwnerId = getUserId(post?.user || post?.creator || post?.author);
  const canEdit = currentUserId && postOwnerId && currentUserId === postOwnerId;
  const imageUrl = post?.image || post?.photo || '';
  const bodyText = post?.body || post?.content || '';
  const sharedPost = post?.sharedPost;
  const likesCount = post?.likesCount || post?.likes?.length || 0;
  const commentsCount = post?.commentsCount || post?.comments?.length || 0;
  const sharesCount = post?.sharesCount || 0;

  return (
    <article className="post-card">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <img
            src={post?.user?.photo || fallbackAvatar}
            alt={post?.user?.name || 'User'}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{post?.user?.name || 'Unknown user'}</h3>
            <p className="text-xs text-slate-500">
              @{post?.user?.username || 'user'} - {new Date(post?.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <span className="text-sm text-slate-400">...</span>
      </div>

      <p className="mb-3 whitespace-pre-wrap text-slate-700">{bodyText || 'No text provided.'}</p>

      {imageUrl ? (
        <img src={imageUrl} alt="Post" className="mb-3 max-h-80 w-full rounded-xl object-cover" />
      ) : null}

      {sharedPost ? (
        <div className="mb-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">{sharedPost?.user?.name || 'Original user'}</p>
            <p className="text-xs text-indigo-600">Original Post</p>
          </div>
          <p className="mt-1 text-xs text-slate-500">@{sharedPost?.user?.username || 'user'}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{sharedPost?.body || sharedPost?.content || ''}</p>
        </div>
      ) : null}

      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <Link className="hover:text-indigo-600" to={`/posts/${postId}/likes`}>
          {likesCount} likes
        </Link>
        <div className="flex items-center gap-3">
          <span>{sharesCount} shares</span>
          <span>{commentsCount} comments</span>
          <Link className="font-medium text-indigo-600" to={`/posts/${postId}`} state={{ post }}>
            View details
          </Link>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 border-t border-slate-200 pt-2">
        <button className="post-action-btn" onClick={() => onLike(postId)}>
          Like
        </button>
        <Link className="post-action-btn text-center" to={`/posts/${postId}`} state={{ post }}>
          Comment
        </Link>
        <button className="post-action-btn" onClick={() => onShare(postId)}>
          Share
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-secondary px-3 py-1.5 text-xs" onClick={() => onBookmark(postId)}>
          Bookmark
        </button>

        {canEdit ? (
          <>
            <Link className="btn-primary px-3 py-1.5 text-xs" to={`/posts/${postId}/edit`} state={{ post }}>
              Edit
            </Link>
            {onDelete ? (
              <button className="btn-danger px-3 py-1.5 text-xs" onClick={() => onDelete(postId)}>
                Delete
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

export default PostCard;
