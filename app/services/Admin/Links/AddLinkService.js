const Links = require("../../../models/Links");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  creatorUserId: "required|integer",
  workspaceId: "required|integer",
  domain: "required|url",
  slashTag: "required",
  destination: "required|url",
  tags: "present|array",
  channels: "present|array",
  site: "present",
  utm: "present",
  isActive: "required|boolean",
};

const errors = {
  1: {
    code: "ERR-ADDLINK-01",
    message: "Workspace, owner, and creator are unrelated to each other.",
  },
  2: {
    code: "ERR-ADDLINK-02",
    message: "Short link already exists.",
  },
  3: {
    code: "ERR-ADDLINK-03",
    message: "Unable to create link record.",
  },
};

const addLink = async body => {
  const {
    ownerUserId,
    creatorUserId,
    workspaceId,
    domain,
    slashTag,
    destination,
    tags,
    channels,
    site,
    utm,
    isActive,
  } = body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", creatorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const existingLink = await Links.query()
    .select("id")
    .where("domain", domain)
    .where("slash_tag", slashTag)
    .first();
  if (existingLink) {
    return { error: errors[2] };
  }

  const newLink = await Links.query().insertAndFetch({
    owner_user_id: ownerUserId,
    creator_user_id: creatorUserId,
    workspace_id: workspaceId,
    domain: domain,
    slash_tag: slashTag,
    destination: destination,
    tags: tags ? JSON.stringify(tags) : null,
    channels: channels ? JSON.stringify(channels) : null,
    site_title: site && site.hasOwnProperty("title") ? site.title : "",
    site_description:
      site && site.hasOwnProperty("description") ? site.description : "",
    site_icon: site && site.hasOwnProperty("icon") ? site.icon : "",
    utm_source: utm && utm.hasOwnProperty("source") ? utm.source : "",
    utm_medium: utm && utm.hasOwnProperty("medium") ? utm.medium : "",
    utm_campaign: utm && utm.hasOwnProperty("campaign") ? utm.campaign : "",
    utm_term: utm && utm.hasOwnProperty("term") ? utm.term : "",
    utm_content: utm && utm.hasOwnProperty("content") ? utm.content : "",
    is_active: isActive,
  });
  if (!newLink) {
    return { error: errors[3] };
  }

  return { link: newLink };
};

module.exports = {
  rules,
  addLink,
};
