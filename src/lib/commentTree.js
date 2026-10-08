/** Backend bo'sh javoblarni null qilib yuboradi — daraxtni bir xillashtiramiz. */
export function normalizeComment(comment) {
  return {
    ...comment,
    replies: (comment.replies || []).map(normalizeComment),
  };
}

export function normalizeComments(list) {
  return (list || []).map(normalizeComment);
}

/** Daraxtga yangi izohni to'g'ri ota-ona ostiga qo'yadi (immutable). */
export function insertComment(tree, parentId, comment) {
  if (!parentId) return [...tree, comment];

  return tree.map((node) => {
    if (node.id === parentId) {
      return { ...node, replies: [...node.replies, comment] };
    }
    if (node.replies.length) {
      return { ...node, replies: insertComment(node.replies, parentId, comment) };
    }
    return node;
  });
}

/** Izohni (va uning javoblarini) daraxtdan olib tashlaydi. */
export function removeComment(tree, id) {
  return tree
    .filter((node) => node.id !== id)
    .map((node) =>
      node.replies.length ? { ...node, replies: removeComment(node.replies, id) } : node
    );
}

/** Ildiz + barcha javoblar soni. */
export function countComments(tree) {
  return tree.reduce((total, node) => total + 1 + countComments(node.replies), 0);
}

/** Javoblari bor izohlar ID si (yig'ish/ochish uchun). */
export function collectParentIds(tree, acc = []) {
  for (const node of tree) {
    if (node.replies.length) {
      acc.push(node.id);
      collectParentIds(node.replies, acc);
    }
  }
  return acc;
}
