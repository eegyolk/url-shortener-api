const Links = require("../../../models/Links");

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
    siteTitle: "required|min:3",
  },
  filter: {
    page: "required|integer",
    pageSize: "required|integer",
    ownerUserId: "required|integer",
    workspaceId: "required|integer",
    domain: "present|array",
    slashTag: "present|min:3",
    tags: "present|array",
    channels: "present|array",
    utmSource: "present|array",
    utmMedium: "present|array",
    utmCampaign: "present|min:3",
    isActive: "present|boolean",
    createdAtFrom: "present|date",
    createdAtTo: "present|date",
  },
};

const errors = {
  1: {
    code: "ERR-FETCHLINK-01",
    message: "Invalid parameter value in fetch link.",
  },
  2: {
    code: "ERR-FETCHLINK-02",
    message: "Unable to fetch link(s) data.",
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

  const links = await Links.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .page(page - 1, pageSize);
  if (!links) {
    return { error: errors[2] };
  }

  return { links };
};

const single = async query => {
  const { id, ownerUserId, workspaceId } = query;

  const link = await Links.query()
    .where("id", id)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .first();

  return { link: link ? link : null };
};

const search = async query => {
  const { page, pageSize, ownerUserId, workspaceId, siteTitle } = query;

  const links = await Links.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .whereRaw(`site_title LIKE "%${siteTitle}%"`)
    .page(page - 1, pageSize);
  if (!links) {
    return { error: errors[2] };
  }

  return { links };
};

const filter = async query => {
  const {
    page,
    pageSize,
    ownerUserId,
    workspaceId,
    domain,
    slashTag,
    tags,
    channels,
    utmSource,
    utmMedium,
    utmCampaign,
    isActive,
    createdAtFrom,
    createdAtTo,
  } = query;

  const queryBuilder = Links.query()
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId);

  if (domain) {
    queryBuilder.whereIn("domain", domain);
  }
  if (slashTag) {
    queryBuilder.whereRaw(`slash_tag LIKE "%${slashTag}%"`);
  }
  if (tags) {
    queryBuilder.whereRaw(`JSON_CONTAINS(tags, "${JSON.stringify(tags)}")`);
  }
  if (channels) {
    queryBuilder.whereRaw(
      `JSON_CONTAINS(channels, "${JSON.stringify(channels)}")`
    );
  }
  if (utmSource) {
    queryBuilder.whereIn("utm_source", utmSource);
  }
  if (utmMedium) {
    queryBuilder.whereIn("utm_medium", utmMedium);
  }
  if (utmCampaign) {
    queryBuilder.whereRaw(`utm_campaign LIKE "%${utmCampaign}%"`);
  }
  if (isActive) {
    queryBuilder.where("isActive", isActive);
  }
  if (createdAtFrom && createdAtTo) {
    queryBuilder.whereRaw(
      `DATE(created_at) BETWEEN "${createdAtFrom}" AND "${createdAtTo}"`
    );
  }

  const links = await queryBuilder.page(page - 1, pageSize);
  if (!links) {
    return { error: errors[2] };
  }

  return { links };
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
