function parsePagination(query = {}, defaults = { page: 1, limit: 5 }) {
  const page = Math.max(1, parseInt(query.page, 10) || defaults.page);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaults.limit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

module.exports = {
  parsePagination,
  buildMeta,
};
