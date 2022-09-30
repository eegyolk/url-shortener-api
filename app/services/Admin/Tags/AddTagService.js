const Tags = require("../../../models/Tags");
const Workspaces = require("../../../models/Workspaces");

const rules = {
  ownerUserId: "required|integer",
  creatorUserId: "required|integer",
  workspaceId: "required|integer",
  name: "required|string",
  description: "present|string",
};

const errors = {
  1: {
    code: "ERR-ADDTAG-01",
    message: "Workspace, owner, and creator are unrelated to each other.",
  },
  2: {
    code: "ERR-ADDTAG-02",
    message: "Tag already exists.",
  },
  3: {
    code: "ERR-ADDTAG-03",
    message: "Unable to create tag record.",
  },
};

const addTag = async body => {
  const { ownerUserId, creatorUserId, workspaceId, name, description } = body;

  const workspaceMember = await Workspaces.relatedQuery("members")
    .select("id")
    .for(workspaceId)
    .where("user_id", creatorUserId)
    .where("owner_user_id", ownerUserId)
    .first();
  if (!workspaceMember) {
    return { error: errors[1] };
  }

  const existingTag = await Tags.query()
    .select("id")
    .where("owner_user_id", ownerUserId)
    .where("workspace_id", workspaceId)
    .where("name", name)
    .first();
  if (existingTag) {
    return { error: errors[2] };
  }

  const newTag = await Tags.query().insertAndFetch({
    owner_user_id: ownerUserId,
    creator_user_id: creatorUserId,
    workspace_id: workspaceId,
    name,
    description: description ? description : "",
  });
  if (!newTag) {
    return { error: errors[3] };
  }

  return { tag: newTag };
};

module.exports = {
  rules,
  addTag,
};
