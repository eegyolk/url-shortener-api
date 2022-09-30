const Channels = require("../../../models/Channels");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  creatorUserId: "required|integer",
  workspaceId: "required|integer",
  name: "required|string",
  platform: "required|string",
  identifier: "required|string",
  description: "present|string",
  iconUrl: "present|string",
};

const errors = {
  1: {
    code: "ERR-ADDCHANNEL-01",
    message: "Workspace, owner, and creator are unrelated to each other.",
  },
  2: {
    code: "ERR-ADDCHANNEL-02",
    message: "Channel already exists.",
  },
  3: {
    code: "ERR-ADDCHANNEL-03",
    message: "Unable to create channel record.",
  },
};

const addChannel = async body => {
  const {
    ownerUserId,
    creatorUserId,
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
    .where("user_id", creatorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const existingChannel = await Channels.query()
    .select("id")
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .where("name", name)
    .where("platform", platform)
    .where("identifier", identifier)
    .first();
  if (existingChannel) {
    return { error: errors[2] };
  }

  const newChannel = await Channels.query().insertAndFetch({
    owner_user_id: ownerUserId,
    creator_user_id: creatorUserId,
    workspace_id: workspaceId,
    name,
    platform,
    identifier,
    description: description ? description : "",
    iconUrl: iconUrl ? iconUrl : "",
  });
  if (!newChannel) {
    return { error: errors[3] };
  }

  return { channel: newChannel };
};

module.exports = {
  rules,
  addChannel,
};
