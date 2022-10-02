const WorkspaceMembers = require("../../../models/WorkspaceMembers");

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
    fullName: "required|min:3",
  },
  filter: {
    page: "required|integer",
    pageSize: "required|integer",
    ownerUserId: "required|integer",
    workspaceId: "required|integer",
    role: "present|array",
    createdAtFrom: "present|date",
    createdAtTo: "present|date",
  },
};

const errors = {
  1: {
    code: "ERR-FETCHMEMBER-01",
    message: "Invalid parameter value in fetch member.",
  },
  2: {
    code: "ERR-FETCHMEMBER-02",
    message: "Unable to fetch member(s) data.",
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

  const workspaceMembers = await WorkspaceMembers.query()
    .withGraphFetched("workspace(selectWorkspaceForWorkspaceMembers)")
    .withGraphFetched("ownerUser(selectUserForWorkspaceMembers)")
    .withGraphFetched("creatorUser(selectUserForWorkspaceMembers)")
    .withGraphFetched("user(selectUserForWorkspaceMembers)")
    .where(`${WorkspaceMembers.tableName}.owner_user_id`, ownerUserId)
    .where(`${WorkspaceMembers.tableName}.workspace_id`, workspaceId)
    .page(page - 1, pageSize);
  if (!workspaceMembers) {
    return { error: errors[2] };
  }

  return { workspaceMembers };
};

const single = async query => {
  const { id, ownerUserId, workspaceId } = query;

  const workspaceMember = await WorkspaceMembers.query()
    .withGraphFetched("workspace(selectWorkspaceForWorkspaceMembers)")
    .withGraphFetched("ownerUser(selectUserForWorkspaceMembers)")
    .withGraphFetched("creatorUser(selectUserForWorkspaceMembers)")
    .withGraphFetched("user(selectUserForWorkspaceMembers)")
    .where(`${WorkspaceMembers.tableName}.owner_user_id`, ownerUserId)
    .where(`${WorkspaceMembers.tableName}.workspace_id`, workspaceId)
    .first();

  return { workspaceMember: workspaceMember ? workspaceMember : null };
};

const search = async query => {
  const { page, pageSize, ownerUserId, workspaceId, fullName } = query;

  const workspaceMembers = await WorkspaceMembers.query()
    .withGraphFetched("workspace(selectWorkspaceForWorkspaceMembers)")
    .withGraphFetched("ownerUser(selectUserForWorkspaceMembers)")
    .withGraphFetched("creatorUser(selectUserForWorkspaceMembers)")
    .withGraphFetched("user(selectUserForWorkspaceMembers)")
    .joinRelated("workspace(selectWorkspaceForWorkspaceMembers)")
    .joinRelated("ownerUser(selectUserForWorkspaceMembers)")
    .joinRelated("creatorUser(selectUserForWorkspaceMembers)")
    .joinRelated("user(selectUserForWorkspaceMembers)")
    .where(`${WorkspaceMembers.tableName}.owner_user_id`, ownerUserId)
    .where(`${WorkspaceMembers.tableName}.workspace_id`, workspaceId)
    .whereRaw(`user.full_name LIKE "%${fullName}%"`)
    .page(page - 1, pageSize);
  if (!workspaceMembers) {
    return { error: errors[2] };
  }

  return { workspaceMembers };
};

const filter = async query => {
  const {
    page,
    pageSize,
    ownerUserId,
    workspaceId,
    role,
    createdAtFrom,
    createdAtTo,
  } = query;

  const queryBuilder = WorkspaceMembers.query()
    .withGraphFetched("workspace(selectWorkspaceForWorkspaceMembers)")
    .withGraphFetched("ownerUser(selectUserForWorkspaceMembers)")
    .withGraphFetched("creatorUser(selectUserForWorkspaceMembers)")
    .withGraphFetched("user(selectUserForWorkspaceMembers)")
    .where(`${WorkspaceMembers.tableName}.owner_user_id`, ownerUserId)
    .where(`${WorkspaceMembers.tableName}.workspace_id`, workspaceId);

  if (role) {
    queryBuilder.whereIn("role", role);
  }
  if (createdAtFrom && createdAtTo) {
    queryBuilder.whereRaw(
      `DATE(created_at) BETWEEN '${createdAtFrom}' AND '${createdAtTo}'`
    );
  }

  const workspaceMembers = await queryBuilder.page(page - 1, pageSize);
  if (!workspaceMembers) {
    return { error: errors[2] };
  }

  return { workspaceMembers };
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
