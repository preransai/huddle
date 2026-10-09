const mongoose = require('mongoose');
const HttpError = require('./HttpError');

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

// Cursor pagination instead of skip/limit: with skip, a new post arriving at the
// top shifts every page down by one and the client sees duplicates while
// scrolling. The cursor is the (createdAt, _id) of the last item served, so the
// next page always starts strictly after it. _id breaks ties between documents
// created in the same millisecond (common with seeded data).
function encodeCursor(doc) {
  return Buffer.from(`${new Date(doc.createdAt).toISOString()}|${doc._id}`).toString('base64url');
}

function decodeCursor(cursor) {
  const [iso, id] = Buffer.from(String(cursor), 'base64url').toString('utf8').split('|');
  const createdAt = new Date(iso);
  if (Number.isNaN(createdAt.getTime()) || !mongoose.isValidObjectId(id)) {
    throw new HttpError(400, 'Invalid cursor');
  }
  return { createdAt, id: new mongoose.Types.ObjectId(id) };
}

function cursorQuery(filter, cursor) {
  if (!cursor) return filter;
  const { createdAt, id } = decodeCursor(cursor);
  return {
    $and: [
      filter,
      { $or: [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: id } }] },
    ],
  };
}

function parseLimit(value, fallback = DEFAULT_LIMIT) {
  const limit = Number.parseInt(value, 10);
  if (Number.isNaN(limit) || limit < 1) return fallback;
  return Math.min(limit, MAX_LIMIT);
}

// Fetches one page newest-first. Asks for one extra document to know whether
// another page exists without running a count query.
async function findPage(Model, filter, { cursor, limit = DEFAULT_LIMIT, populate } = {}) {
  let query = Model.find(cursorQuery(filter, cursor))
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1);
  if (populate) query = query.populate(populate);

  const docs = await query.lean();
  const hasMore = docs.length > limit;
  if (hasMore) docs.pop();

  return { docs, nextCursor: hasMore ? encodeCursor(docs[docs.length - 1]) : null };
}

module.exports = { encodeCursor, decodeCursor, cursorQuery, parseLimit, findPage };
