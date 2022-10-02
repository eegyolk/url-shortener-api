const Workspaces = require("../../../models/Workspaces");

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
  },
  single: {
    id: "required|integer",
    ownerUserId: "required|integer",
  },
  search: {
    page: "required|integer",
    pageSize: "required|integer",
    ownerUserId: "required|integer",
    name: "required|min:3",
  },
  filter: {
    page: "required|integer",
    pageSize: "required|integer",
    ownerUserId: "required|integer",
    spaceCharacter: "present|array",
    createdAtFrom: "present|date",
    createdAtTo: "present|date",
  },
};

const errors = {
  1: {
    code: "ERR-FETCHWORKSPACE-01",
    message: "Invalid parameter value in fetch workspace.",
  },
  2: {
    code: "ERR-FETCHWORKSPACE-02",
    message: "Unable to fetch workspace(s) data.",
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
  const { page, pageSize, ownerUserId } = query;

  const workspaces = await Workspaces.query()
    .where("owner_user_id", ownerUserId)
    .page(page - 1, pageSize);
  if (!workspaces) {
    return { error: errors[2] };
  }

  return { workspaces };
};

const single = async query => {
  const { id, ownerUserId } = query;

  const workspace = await Workspaces.query()
    .where("id", id)
    .where("owner_user_id", ownerUserId)

    .first();

  return { workspace: workspace ? workspace : null };
};

const search = async query => {
  const { page, pageSize, ownerUserId, name } = query;

  const workspaces = await Workspaces.query()
    .where("owner_user_id", ownerUserId)
    .whereRaw(`name LIKE "${name}%"`)
    .page(page - 1, pageSize);
  if (!workspaces) {
    return { error: errors[2] };
  }

  return { workspaces };
};

const filter = async query => {
  const {
    page,
    pageSize,
    ownerUserId,
    spaceCharacter,
    createdAtFrom,
    createdAtTo,
  } = query;

  const queryBuilder = Workspaces.query().where("owner_user_id", ownerUserId);

  if (spaceCharacter) {
    queryBuilder.whereIn("space_character", spaceCharacter);
  }
  if (createdAtFrom && createdAtTo) {
    queryBuilder.whereRaw(
      `DATE(created_at) BETWEEN "${createdAtFrom}" AND "${createdAtTo}"`
    );
  }

  const workspaces = await queryBuilder.page(page - 1, pageSize);
  if (!workspaces) {
    return { error: errors[2] };
  }

  return { workspaces };
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
