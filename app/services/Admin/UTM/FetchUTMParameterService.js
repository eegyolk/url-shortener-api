const UTMParameterValues = require("../../../models/UTMParameterValues");

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
    value: "required|min:3",
  },
  filter: {
    page: "required|integer",
    pageSize: "required|integer",
    ownerUserId: "required|integer",
    workspaceId: "required|integer",
    utmParameterId: "present|array",
    createdAtFrom: "present|date",
    createdAtTo: "present|date",
  },
};

const errors = {
  1: {
    code: "ERR-UTMPARAMETERVALUE-01",
    message: "Invalid parameter value in fetch utm parameter value.",
  },
  2: {
    code: "ERR-UTMPARAMETERVALUE-02",
    message: "Unable to fetch UTM parameter values(s) data.",
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

  const utmParameterValues = await UTMParameterValues.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .page(page - 1, pageSize);
  if (!utmParameterValues) {
    return { error: errors[2] };
  }

  return { utmParameterValues };
};

const single = async query => {
  const { id, ownerUserId, workspaceId } = query;

  const utmParameterValue = await UTMParameterValues.query()
    .where("id", id)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .first();

  return {
    utmParameterValue: utmParameterValue ? utmParameterValue : null,
  };
};

const search = async query => {
  const { page, pageSize, ownerUserId, workspaceId, value } = query;

  const utmParameterValues = await UTMParameterValues.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .whereRaw(`value LIKE "${value}%"`)
    .page(page - 1, pageSize);
  if (!utmParameterValues) {
    return { error: errors[2] };
  }

  return { utmParameterValues };
};

const filter = async query => {
  const {
    page,
    pageSize,
    ownerUserId,
    workspaceId,
    utmParameterId,
    createdAtFrom,
    createdAtTo,
  } = query;

  const queryBuilder = UTMParameterValues.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId);

  if (utmParameterId) {
    queryBuilder.whereIn("utm_parameter_id", utmParameterId);
  }
  if (createdAtFrom && createdAtTo) {
    queryBuilder.whereRaw(
      `DATE(created_at) BETWEEN "${createdAtFrom}" AND "${createdAtTo}"`
    );
  }

  const utmParameterValues = await queryBuilder.page(page - 1, pageSize);
  if (!utmParameterValues) {
    return { error: errors[2] };
  }

  return { utmParameterValues };
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
