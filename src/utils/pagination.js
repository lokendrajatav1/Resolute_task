export function parseQuery(q) {
  const page = Math.max(1, Number(q.page || 1));
  const limit = Math.min(100, Math.max(1, Number(q.limit || 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
