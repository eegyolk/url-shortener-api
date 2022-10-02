const moment = require("moment");

const Links = require("../../../models/Links");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  id: "required|integer",
  ownerUserId: "required|integer",
  editorUserId: "required|integer",
  workspaceId: "required|integer",
  domain: "required|url",
  slashTag: "required",
  destination: "present|url",
  tags: "present|array",
  channels: "present|array",
  site: "present",
  utm: "present",
  isActive: "required|boolean",
};

const errors = {
  1: {
    code: "ERR-EDITLINK-01",
    message: "Workspace, owner, and editor are unrelated to each other.",
  },
  2: {
    code: "ERR-EDITLINK-02",
    message: "Link already exists.",
  },
  3: {
    code: "ERR-EDITLINK-03",
    message: "Unable to edit link record.",
  },
};

const editLink = async body => {
  const {
    id,
    ownerUserId,
    editorUserId,
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
    .where("user_id", editorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const existingLink = await Links.query()
    .select("id")
    .whereNot("id", id)
    .where("domain", domain)
    .where("slash_tag", slashTag)
    .first();
  if (existingLink) {
    return { error: errors[2] };
  }

  const patchData = {
    domain,
    slashTag,
    is_active: isActive,
    updated_at: moment().format(),
  };
  if (destination) {
    patchData["destination"] = destination;
  }
  if (tags) {
    patchData["tags"] = JSON.stringify(tags);
  }
  if (channels) {
    patchData["channels"] = JSON.stringify(channels);
  }
  if (site) {
    if (site.hasOwnProperty("title")) {
      patchData["site_title"] = site.title;
    }
    if (site.hasOwnProperty("description")) {
      patchData["site_description"] = site.description;
    }
    if (site.hasOwnProperty("icon")) {
      patchData["site_icon"] = site.icon;
    }
  }
  if (utm) {
    if (utm.hasOwnProperty("source")) {
      patchData["source"] = utm.source;
    }
    if (utm.hasOwnProperty("medium")) {
      patchData["medium"] = utm.medium;
    }
    if (utm.hasOwnProperty("campaign")) {
      patchData["campaign"] = utm.campaign;
    }
    if (utm.hasOwnProperty("term")) {
      patchData["term"] = utm.term;
    }
    if (utm.hasOwnProperty("content")) {
      patchData["content"] = utm.content;
    }
  }

  const editedLink = await Links.query().patchAndFetchById(id, patchData);
  if (!editedLink) {
    return { error: errors[3] };
  }

  return { link: editedLink };
};

module.exports = {
  rules,
  editLink,
};
