const Domains = require("../../../models/Domains");

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
    code: "ERR-FETCHDOMAIN-01",
    message: "Invalid parameter value in fetch domain.",
  },
  2: {
    code: "ERR-FETCHDOMAIN-02",
    message: "Unable to fetch domain(s) data.",
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

  const domains = await Domains.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .page(page - 1, pageSize);
  if (!domains) {
    return { error: errors[2] };
  }

  return { domains };
};

const single = async query => {
  const { id, ownerUserId, workspaceId } = query;

  const domain = await Domains.query()
    .where("id", id)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .first();

  return { domain: domain ? domain : null };
};

const search = async query => {
  const { page, pageSize, ownerUserId, workspaceId, name } = query;

  const domains = await Domains.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .whereRaw(`name LIKE "%${name}%"`)
    .page(page - 1, pageSize);
  if (!domains) {
    return { error: errors[2] };
  }

  return { domains };
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

  const queryBuilder = Domains.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId);

  if (createdAtFrom && createdAtTo) {
    queryBuilder.whereRaw(
      `DATE(created_at) BETWEEN "${createdAtFrom}" AND "${createdAtTo}"`
    );
  }

  const domains = await queryBuilder.page(page - 1, pageSize);
  if (!domains) {
    return { error: errors[2] };
  }

  return { domains };
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
