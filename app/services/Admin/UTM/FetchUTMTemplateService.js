const UTMParameterTemplates = require("../../../models/UTMParameterTemplates");

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
    utmSource: "present|array",
    utmMedium: "present|array",
    utmCampaign: "present|min:3",
    createdAtFrom: "present|date",
    createdAtTo: "present|date",
  },
};

const errors = {
  1: {
    code: "ERR-UTMPARAMETERTEMPLATE-01",
    message: "Invalid parameter value in fetch utm parameter template.",
  },
  2: {
    code: "ERR-UTMPARAMETERTEMPLATE-02",
    message: "Unable to fetch UTM parameter template(s) data.",
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

  const utmParameterTemplates = await UTMParameterTemplates.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .page(page - 1, pageSize);
  if (!utmParameterTemplates) {
    return { error: errors[2] };
  }

  return { utmParameterTemplates };
};

const single = async query => {
  const { id, ownerUserId, workspaceId } = query;

  const utmParameterTemplate = await UTMParameterTemplates.query()
    .where("id", id)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .first();

  return {
    utmParameterTemplate: utmParameterTemplate ? utmParameterTemplate : null,
  };
};

const search = async query => {
  const { page, pageSize, ownerUserId, workspaceId, name } = query;

  const utmParameterTemplates = await UTMParameterTemplates.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .whereRaw(`name LIKE "${name}%"`)
    .page(page - 1, pageSize);
  if (!utmParameterTemplates) {
    return { error: errors[2] };
  }

  return { utmParameterTemplates };
};

const filter = async query => {
  const {
    page,
    pageSize,
    ownerUserId,
    workspaceId,
    utmSource,
    utmMedium,
    utmCampaign,
    createdAtFrom,
    createdAtTo,
  } = query;

  const queryBuilder = UTMParameterTemplates.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId);

  if (utmSource) {
    queryBuilder.whereIn("utm_source", utmSource);
  }
  if (utmMedium) {
    queryBuilder.whereIn("utm_medium", utmMedium);
  }
  if (utmCampaign) {
    queryBuilder.whereRaw(`utm_campaign LIKE "${utmCampaign}%"`);
  }
  if (createdAtFrom && createdAtTo) {
    queryBuilder.whereRaw(
      `DATE(created_at) BETWEEN "${createdAtFrom}" AND "${createdAtTo}"`
    );
  }

  const utmParameterTemplates = await queryBuilder.page(page - 1, pageSize);
  if (!utmParameterTemplates) {
    return { error: errors[2] };
  }

  return { utmParameterTemplates };
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
