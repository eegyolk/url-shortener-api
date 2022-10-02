const moment = require("moment");

const Channels = require("../../../models/Channels");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  id: "required|integer",
  ownerUserId: "required|integer",
  editorUserId: "required|integer",
  workspaceId: "required|integer",
  name: "required|string",
  platform: "required|string",
  identifier: "required|string",
  description: "present|string",
  iconUrl: "present|string",
};

const errors = {
  1: {
    code: "ERR-EDITCHANNEL-01",
    message: "Workspace, owner, and editor are unrelated to each other.",
  },
  2: {
    code: "ERR-EDITCHANNEL-02",
    message: "Channel already exists.",
  },
  3: {
    code: "ERR-EDITCHANNEL-03",
    message: "Unable to edit channel record.",
  },
};

const editChannel = async body => {
  const {
    id,
    ownerUserId,
    editorUserId,
    workspaceId,
    name,
    platform,
    identifier,
    description,
    iconUrl,
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

  const existingChannel = await Channels.query()
    .select("id")
    .whereNot("id", id)
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .where("name", name)
    .where("platform", platform)
    .where("identifier", identifier)
    .first();
  if (existingChannel) {
    return { error: errors[2] };
  }

  const patchData = {
    name,
    platform,
    identifier,
    updated_at: moment().format(),
  };
  if (description) {
    patchData["description"] = description;
  }
  if (iconUrl) {
    patchData["icon_url"] = iconUrl;
  }

  const editedChannel = await Channels.query().patchAndFetchById(id, patchData);
  if (!editedChannel) {
    return { error: errors[3] };
  }

  return { channel: editedChannel };
};

module.exports = {
  rules,
  editChannel,
};
