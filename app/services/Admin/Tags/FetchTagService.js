const Tags = require("../../../models/Tags");

const types = {
  ALL: 0,
  SINGLE: 1,
  SEARCH: 2,
  FILTER: 3,
};

const rules = {
  all: {
    page: "required|integer",
    pageSize: "required|integer",
    ownerUserId: "required|integer",
    workspaceId: "required|integer",
  },
  single: {
    id: "required|integer",
    ownerUserId: "required|integer",
    workspaceId: "required|integer",
  },
  search: {
    page: "required|integer",
    pageSize: "required|integer",
    ownerUserId: "required|integer",
    workspaceId: "required|integer",
    name: "required|min:3",
  },
  filter: {
    page: "required|integer",
    pageSize: "required|integer",
    ownerUserId: "required|integer",
    workspaceId: "required|integer",
    createdAtFrom: "present|date",
    createdAtTo: "present|date",
  },
};

const errors = {
  1: {
    code: "ERR-FETCHTAG-01",
    message: "Invalid parameter value in fetch tag.",
  },
  2: {
    code: "ERR-FETCHTAG-02",
    message: "Unable to fetch tag(s) data.",
  },
};

const getType = value => {
  if (typeof value === "undefined") {
    return { type: types.ALL };
  } else {
    if (!isNaN(parseInt(value))) {
      return { type: types.SINGLE };
    } else {
      if (value.toLowerCase() === "search") {
        return { type: types.SEARCH };
      } else if (value.toLowerCase() === "filter") {
        return { type: types.FILTER };
      }
    }
  }

  return { error: errors[1] };
};

const all = async query => {
  const { page, pageSize, ownerUserId, workspaceId } = query;

  const tags = await Tags.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .page(page - 1, pageSize);
  if (!tags) {
    return { error: errors[2] };
  }

  return { tags };
};

const single = async query => {
  const { id, ownerUserId, workspaceId } = query;

  const tag = await Tags.query()
    .where("id", id)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .first();

  return { tag: tag ? tag : null };
};

const search = async query => {
  const { page, pageSize, ownerUserId, workspaceId, name } = query;

  const tags = await Tags.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .whereRaw(`name LIKE "%${name}%"`)
    .page(page - 1, pageSize);
  if (!tags) {
    return { error: errors[2] };
  }

  return { tags };
};

const filter = async query => {
  const {
    page,
    pageSize,
    ownerUserId,
    workspaceId,
    createdAtFrom,
    createdAtTo,
  } = query;

  const queryBuilder = Tags.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId);

  if (createdAtFrom && createdAtTo) {
    queryBuilder.whereRaw(
      `DATE(created_at) BETWEEN "${createdAtFrom}" AND "${createdAtTo}"`
    );
  }

  const tags = await queryBuilder.page(page - 1, pageSize);
  if (!tags) {
    return { error: errors[2] };
  }

  return { tags };
};

module.exports = {
  types,
  rules,
  getType,
  all,
  single,
  search,
  filter,
};
